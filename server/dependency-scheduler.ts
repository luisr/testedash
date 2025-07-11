import { Activity, ActivityDependency, ActivityConstraint } from "@shared/schema";
import { storage } from "./storage";

export interface ScheduleCalculation {
  activityId: number;
  earlyStart: Date;
  earlyFinish: Date;
  lateStart: Date;
  lateFinish: Date;
  totalFloat: number;
  isCritical: boolean;
}

export class DependencyScheduler {
  private activities: Activity[] = [];
  private dependencies: ActivityDependency[] = [];
  private constraints: ActivityConstraint[] = [];

  constructor(activities: Activity[], dependencies: ActivityDependency[], constraints: ActivityConstraint[] = []) {
    this.activities = activities;
    this.dependencies = dependencies;
    this.constraints = constraints;
  }

  /**
   * Calculate forward pass - Early Start and Early Finish dates
   */
  private calculateForwardPass(): Map<number, { earlyStart: Date; earlyFinish: Date }> {
    const result = new Map<number, { earlyStart: Date; earlyFinish: Date }>();
    const visited = new Set<number>();

    const calculateEarlyDates = (activityId: number): { earlyStart: Date; earlyFinish: Date } => {
      if (visited.has(activityId)) {
        return result.get(activityId)!;
      }

      const activity = this.activities.find(a => a.id === activityId);
      if (!activity) throw new Error(`Activity ${activityId} not found`);

      visited.add(activityId);

      // Get all predecessors
      const predecessors = this.dependencies.filter(d => d.successorId === activityId && d.isActive);
      
      let earlyStart: Date;
      
      if (predecessors.length === 0) {
        // No predecessors - use planned start date or project start
        earlyStart = activity.plannedStartDate || new Date();
      } else {
        // Calculate based on predecessors
        let maxFinish = new Date(0);
        
        for (const pred of predecessors) {
          const predResult = calculateEarlyDates(pred.predecessorId);
          let dependentDate: Date;
          
          switch (pred.dependencyType) {
            case 'finish_to_start':
              dependentDate = new Date(predResult.earlyFinish);
              break;
            case 'start_to_start':
              dependentDate = new Date(predResult.earlyStart);
              break;
            case 'finish_to_finish':
              dependentDate = new Date(predResult.earlyFinish);
              break;
            case 'start_to_finish':
              dependentDate = new Date(predResult.earlyStart);
              break;
            default:
              dependentDate = new Date(predResult.earlyFinish);
          }
          
          // Apply lag time
          dependentDate.setDate(dependentDate.getDate() + (pred.lagTime || 0));
          
          if (dependentDate > maxFinish) {
            maxFinish = dependentDate;
          }
        }
        
        earlyStart = maxFinish;
      }

      // Apply constraints
      const activityConstraints = this.constraints.filter(c => c.activityId === activityId && c.isActive);
      for (const constraint of activityConstraints) {
        switch (constraint.constraintType) {
          case 'start_no_earlier_than':
            if (earlyStart < constraint.constraintDate) {
              earlyStart = new Date(constraint.constraintDate);
            }
            break;
          case 'must_start_on':
            earlyStart = new Date(constraint.constraintDate);
            break;
        }
      }

      // Calculate early finish
      const duration = activity.duration || 1;
      const earlyFinish = new Date(earlyStart);
      earlyFinish.setDate(earlyFinish.getDate() + duration);

      const dates = { earlyStart, earlyFinish };
      result.set(activityId, dates);
      return dates;
    };

    // Calculate for all activities
    for (const activity of this.activities) {
      if (!visited.has(activity.id)) {
        calculateEarlyDates(activity.id);
      }
    }

    return result;
  }

  /**
   * Calculate backward pass - Late Start and Late Finish dates
   */
  private calculateBackwardPass(forwardPass: Map<number, { earlyStart: Date; earlyFinish: Date }>): Map<number, { lateStart: Date; lateFinish: Date }> {
    const result = new Map<number, { lateStart: Date; lateFinish: Date }>();
    const visited = new Set<number>();

    // Find project finish date (latest early finish)
    let projectFinish = new Date(0);
    for (const [, dates] of forwardPass) {
      if (dates.earlyFinish > projectFinish) {
        projectFinish = dates.earlyFinish;
      }
    }

    const calculateLateDates = (activityId: number): { lateStart: Date; lateFinish: Date } => {
      if (visited.has(activityId)) {
        return result.get(activityId)!;
      }

      const activity = this.activities.find(a => a.id === activityId);
      if (!activity) throw new Error(`Activity ${activityId} not found`);

      visited.add(activityId);

      // Get all successors
      const successors = this.dependencies.filter(d => d.predecessorId === activityId && d.isActive);
      
      let lateFinish: Date;
      
      if (successors.length === 0) {
        // No successors - use project finish date
        lateFinish = new Date(projectFinish);
      } else {
        // Calculate based on successors
        let minStart = new Date(2100, 0, 1); // Far future date
        
        for (const succ of successors) {
          const succResult = calculateLateDates(succ.successorId);
          let dependentDate: Date;
          
          switch (succ.dependencyType) {
            case 'finish_to_start':
              dependentDate = new Date(succResult.lateStart);
              break;
            case 'start_to_start':
              dependentDate = new Date(succResult.lateStart);
              break;
            case 'finish_to_finish':
              dependentDate = new Date(succResult.lateFinish);
              break;
            case 'start_to_finish':
              dependentDate = new Date(succResult.lateFinish);
              break;
            default:
              dependentDate = new Date(succResult.lateStart);
          }
          
          // Apply lag time (subtract for backward pass)
          dependentDate.setDate(dependentDate.getDate() - (succ.lagTime || 0));
          
          if (dependentDate < minStart) {
            minStart = dependentDate;
          }
        }
        
        lateFinish = minStart;
      }

      // Apply constraints
      const activityConstraints = this.constraints.filter(c => c.activityId === activityId && c.isActive);
      for (const constraint of activityConstraints) {
        switch (constraint.constraintType) {
          case 'finish_no_later_than':
            if (lateFinish > constraint.constraintDate) {
              lateFinish = new Date(constraint.constraintDate);
            }
            break;
          case 'must_finish_on':
            lateFinish = new Date(constraint.constraintDate);
            break;
        }
      }

      // Calculate late start
      const duration = activity.duration || 1;
      const lateStart = new Date(lateFinish);
      lateStart.setDate(lateStart.getDate() - duration);

      const dates = { lateStart, lateFinish };
      result.set(activityId, dates);
      return dates;
    };

    // Calculate for all activities
    for (const activity of this.activities) {
      if (!visited.has(activity.id)) {
        calculateLateDates(activity.id);
      }
    }

    return result;
  }

  /**
   * Calculate complete schedule with critical path analysis
   */
  calculateSchedule(): ScheduleCalculation[] {
    const forwardPass = this.calculateForwardPass();
    const backwardPass = this.calculateBackwardPass(forwardPass);
    
    const results: ScheduleCalculation[] = [];
    
    for (const activity of this.activities) {
      const early = forwardPass.get(activity.id)!;
      const late = backwardPass.get(activity.id)!;
      
      // Calculate total float (slack)
      const totalFloat = Math.floor((late.lateStart.getTime() - early.earlyStart.getTime()) / (1000 * 60 * 60 * 24));
      
      // Activity is critical if total float is zero
      const isCritical = totalFloat === 0;
      
      results.push({
        activityId: activity.id,
        earlyStart: early.earlyStart,
        earlyFinish: early.earlyFinish,
        lateStart: late.lateStart,
        lateFinish: late.lateFinish,
        totalFloat,
        isCritical
      });
    }
    
    return results;
  }

  /**
   * Update activity dates based on schedule calculations
   */
  async updateActivityDates(calculations: ScheduleCalculation[]): Promise<void> {
    for (const calc of calculations) {
      const activity = this.activities.find(a => a.id === calc.activityId);
      if (!activity) continue;

      // Only update if auto-scheduling is enabled
      if (activity.isAutoScheduled) {
        await storage.updateActivity(calc.activityId, {
          plannedStartDate: calc.earlyStart,
          plannedEndDate: calc.earlyFinish,
          criticalPath: calc.isCritical
        });
      }
    }
  }

  /**
   * Validate dependencies for circular references
   */
  validateDependencies(): string[] {
    const errors: string[] = [];
    const visited = new Set<number>();
    const recursionStack = new Set<number>();

    const hasCycle = (activityId: number): boolean => {
      if (recursionStack.has(activityId)) {
        return true; // Circular dependency found
      }
      
      if (visited.has(activityId)) {
        return false;
      }

      visited.add(activityId);
      recursionStack.add(activityId);

      // Check all successors
      const successors = this.dependencies.filter(d => d.predecessorId === activityId && d.isActive);
      for (const succ of successors) {
        if (hasCycle(succ.successorId)) {
          errors.push(`Circular dependency detected involving activity ${activityId} -> ${succ.successorId}`);
          return true;
        }
      }

      recursionStack.delete(activityId);
      return false;
    };

    // Check all activities for cycles
    for (const activity of this.activities) {
      if (!visited.has(activity.id)) {
        hasCycle(activity.id);
      }
    }

    return errors;
  }

  /**
   * Get critical path activities
   */
  getCriticalPath(): number[] {
    const calculations = this.calculateSchedule();
    return calculations.filter(c => c.isCritical).map(c => c.activityId);
  }

  /**
   * Calculate project duration
   */
  getProjectDuration(): number {
    const calculations = this.calculateSchedule();
    if (calculations.length === 0) return 0;

    const projectStart = Math.min(...calculations.map(c => c.earlyStart.getTime()));
    const projectEnd = Math.max(...calculations.map(c => c.earlyFinish.getTime()));
    
    return Math.ceil((projectEnd - projectStart) / (1000 * 60 * 60 * 24));
  }
}

/**
 * Global function to recalculate schedule for a dashboard
 */
export async function recalculateDashboardSchedule(dashboardId: number): Promise<ScheduleCalculation[]> {
  try {
    // Get all activities for the dashboard
    const activities = await storage.getActivitiesByDashboardId(dashboardId);
    
    // Get all dependencies (we'll need to implement these methods)
    const dependencies = await storage.getActivityDependencies(dashboardId);
    const constraints = await storage.getActivityConstraints(dashboardId);
    
    // Create scheduler and calculate
    const scheduler = new DependencyScheduler(activities, dependencies, constraints);
    
    // Validate dependencies first
    const errors = scheduler.validateDependencies();
    if (errors.length > 0) {
      throw new Error(`Dependency validation failed: ${errors.join(', ')}`);
    }
    
    // Calculate schedule
    const calculations = scheduler.calculateSchedule();
    
    // Update activity dates
    await scheduler.updateActivityDates(calculations);
    
    return calculations;
  } catch (error) {
    console.error('Error recalculating schedule:', error);
    throw error;
  }
}
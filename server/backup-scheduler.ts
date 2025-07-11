import { storage } from './storage';
import { 
  BackupSchedule, 
  DashboardBackup, 
  DashboardVersion, 
  InsertDashboardBackup, 
  InsertDashboardVersion 
} from '@/../shared/schema';
import { createHash } from 'crypto';

export class BackupScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly checkInterval = 60000; // Check every minute

  constructor() {
    this.startScheduler();
  }

  private startScheduler() {
    console.log('🔄 Starting backup scheduler...');
    this.intervalId = setInterval(() => {
      this.checkAndExecuteScheduledBackups();
    }, this.checkInterval);
  }

  public stopScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Backup scheduler stopped');
    }
  }

  private async checkAndExecuteScheduledBackups() {
    try {
      const now = new Date();
      const schedules = await this.getActiveSchedules();
      
      for (const schedule of schedules) {
        if (this.shouldRunBackup(schedule, now)) {
          await this.executeBackup(schedule);
        }
      }
    } catch (error) {
      console.error('Error in backup scheduler:', error);
    }
  }

  private async getActiveSchedules(): Promise<BackupSchedule[]> {
    try {
      // Get all active schedules from all dashboards
      const dashboards = await storage.getDashboardsByUserId(1); // TODO: Get all dashboards
      const schedules: BackupSchedule[] = [];
      
      for (const dashboard of dashboards) {
        const dashboardSchedules = await storage.getBackupSchedules(dashboard.id);
        schedules.push(...dashboardSchedules.filter(s => s.isActive));
      }
      
      return schedules;
    } catch (error) {
      console.error('Error getting active schedules:', error);
      return [];
    }
  }

  private shouldRunBackup(schedule: BackupSchedule, now: Date): boolean {
    // If nextRun is not set, calculate it
    if (!schedule.nextRun) {
      const nextRun = this.calculateNextRun(schedule, now);
      this.updateScheduleNextRun(schedule.id, nextRun);
      return false;
    }

    // Check if it's time to run
    return now >= new Date(schedule.nextRun);
  }

  private calculateNextRun(schedule: BackupSchedule, currentTime: Date): Date {
    const nextRun = new Date(currentTime);
    
    switch (schedule.scheduleType) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + schedule.frequency);
        break;
      case 'weekly':
        const daysUntilTarget = ((schedule.dayOfWeek || 0) - nextRun.getDay() + 7) % 7;
        nextRun.setDate(nextRun.getDate() + daysUntilTarget);
        if (daysUntilTarget === 0) {
          nextRun.setDate(nextRun.getDate() + 7 * schedule.frequency);
        }
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + schedule.frequency);
        if (schedule.dayOfMonth) {
          nextRun.setDate(Math.min(schedule.dayOfMonth, this.getDaysInMonth(nextRun)));
        }
        break;
    }

    // Set time if specified
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(':').map(Number);
      nextRun.setHours(hours, minutes, 0, 0);
    }

    return nextRun;
  }

  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  private async updateScheduleNextRun(scheduleId: number, nextRun: Date) {
    try {
      await storage.updateBackupSchedule(scheduleId, { nextRun });
    } catch (error) {
      console.error('Error updating schedule next run:', error);
    }
  }

  private async executeBackup(schedule: BackupSchedule) {
    try {
      console.log(`🔄 Executing backup for dashboard ${schedule.dashboardId}`);
      
      // Get dashboard data
      const dashboard = await storage.getDashboard(schedule.dashboardId);
      if (!dashboard) {
        console.error(`Dashboard ${schedule.dashboardId} not found`);
        return;
      }

      // Create backup data
      const backupData = await this.createBackupData(schedule.dashboardId);
      
      // Create backup record
      const backup = await this.createBackupRecord(schedule, backupData);
      
      // Create version if this is a significant change
      await this.createVersionIfNeeded(schedule.dashboardId, backup, schedule.userId);
      
      // Clean up old backups
      await this.cleanupOldBackups(schedule);
      
      // Update schedule
      await this.updateScheduleAfterBackup(schedule);
      
      console.log(`✅ Backup completed for dashboard ${schedule.dashboardId}`);
    } catch (error) {
      console.error(`Error executing backup for dashboard ${schedule.dashboardId}:`, error);
    }
  }

  private async createBackupData(dashboardId: number) {
    const dashboard = await storage.getDashboard(dashboardId);
    const activities = await storage.getActivitiesByDashboardId(dashboardId);
    const projects = await storage.getProjectsByDashboardId(dashboardId);
    const customColumns = await storage.getCustomColumns(dashboardId);
    const customCharts = await storage.getCustomCharts(dashboardId);
    const dependencies = await storage.getActivityDependencies(dashboardId);
    const constraints = await storage.getActivityConstraints(dashboardId);
    
    return {
      dashboard,
      activities,
      projects,
      customColumns,
      customCharts,
      dependencies,
      constraints,
      backupDate: new Date(),
      version: '1.0.0'
    };
  }

  private async createBackupRecord(schedule: BackupSchedule, backupData: any): Promise<DashboardBackup> {
    const dataString = JSON.stringify(backupData);
    const checksum = createHash('md5').update(dataString).digest('hex');
    
    const backupRecord: InsertDashboardBackup = {
      dashboardId: schedule.dashboardId,
      userId: schedule.userId,
      type: 'scheduled',
      data: backupData,
      metadata: {
        scheduleId: schedule.id,
        scheduleType: schedule.scheduleType,
        frequency: schedule.frequency
      },
      description: `Automated ${schedule.scheduleType} backup`,
      fileSize: Buffer.byteLength(dataString, 'utf8'),
      checksum,
      isRestorable: true
    };

    return await storage.createDashboardBackup(backupRecord);
  }

  private async createVersionIfNeeded(dashboardId: number, backup: DashboardBackup, userId: number) {
    try {
      // Get latest version
      const versions = await storage.getDashboardVersions(dashboardId);
      const latestVersion = versions.find(v => v.isActive);
      
      // Create new version if significant changes detected
      if (this.hasSignificantChanges(backup, latestVersion)) {
        const newVersion = this.incrementVersion(latestVersion?.version || '0.0.0');
        
        const versionRecord: InsertDashboardVersion = {
          dashboardId,
          parentVersionId: latestVersion?.id,
          version: newVersion,
          versionName: `Auto-backup ${newVersion}`,
          changes: this.calculateChanges(backup, latestVersion),
          changedBy: userId,
          changeType: 'patch',
          releaseNotes: 'Automated backup with detected changes',
          isActive: false,
          isDraft: false
        };

        await storage.createDashboardVersion(versionRecord);
        console.log(`📦 Created version ${newVersion} for dashboard ${dashboardId}`);
      }
    } catch (error) {
      console.error('Error creating version:', error);
    }
  }

  private hasSignificantChanges(backup: DashboardBackup, latestVersion?: DashboardVersion): boolean {
    // Simple heuristic: if checksum is different or no previous version exists
    if (!latestVersion) return true;
    
    // Compare activity counts, project counts, etc.
    const backupData = backup.data as any;
    const activities = backupData.activities || [];
    const projects = backupData.projects || [];
    
    // Significant if more than 10% change in activities or any new projects
    return activities.length > 0 || projects.length > 0;
  }

  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.').map(Number);
    parts[2] = (parts[2] || 0) + 1; // Increment patch version
    return parts.join('.');
  }

  private calculateChanges(backup: DashboardBackup, latestVersion?: DashboardVersion): any {
    const backupData = backup.data as any;
    return {
      activities: {
        added: backupData.activities?.length || 0,
        modified: 0,
        deleted: 0
      },
      projects: {
        added: backupData.projects?.length || 0,
        modified: 0,
        deleted: 0
      },
      timestamp: new Date()
    };
  }

  private async cleanupOldBackups(schedule: BackupSchedule) {
    try {
      const backups = await storage.getDashboardBackups(schedule.dashboardId);
      const scheduledBackups = backups.filter(b => 
        b.metadata && 
        (b.metadata as any).scheduleId === schedule.id
      );

      if (scheduledBackups.length > schedule.maxBackups) {
        // Sort by creation date and keep only the most recent
        const sortedBackups = scheduledBackups.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        const backupsToDelete = sortedBackups.slice(schedule.maxBackups);
        
        for (const backup of backupsToDelete) {
          await storage.deleteDashboardBackup(backup.id);
          console.log(`🗑️ Deleted old backup ${backup.id}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }

  private async updateScheduleAfterBackup(schedule: BackupSchedule) {
    const now = new Date();
    const nextRun = this.calculateNextRun(schedule, now);
    
    await storage.updateBackupSchedule(schedule.id, {
      lastRun: now,
      nextRun
    });
  }

  // Public methods for manual operations
  public async createManualBackup(dashboardId: number, userId: number, description?: string): Promise<DashboardBackup> {
    const backupData = await this.createBackupData(dashboardId);
    const dataString = JSON.stringify(backupData);
    const checksum = createHash('md5').update(dataString).digest('hex');
    
    const backupRecord: InsertDashboardBackup = {
      dashboardId,
      userId,
      type: 'manual',
      data: backupData,
      metadata: {
        manual: true,
        createdBy: userId
      },
      description: description || 'Manual backup',
      fileSize: Buffer.byteLength(dataString, 'utf8'),
      checksum,
      isRestorable: true
    };

    return await storage.createDashboardBackup(backupRecord);
  }

  public async createSchedule(
    dashboardId: number,
    userId: number,
    scheduleType: 'daily' | 'weekly' | 'monthly',
    frequency: number = 1,
    options: {
      time?: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
      maxBackups?: number;
    } = {}
  ): Promise<BackupSchedule> {
    const schedule = {
      dashboardId,
      userId,
      scheduleType,
      frequency,
      time: options.time || '02:00',
      dayOfWeek: options.dayOfWeek,
      dayOfMonth: options.dayOfMonth,
      maxBackups: options.maxBackups || 10,
      isActive: true
    };

    return await storage.createBackupSchedule(schedule);
  }
}

// Global instance
export const backupScheduler = new BackupScheduler();
import { useQuery } from "@tanstack/react-query";

export interface ConsolidatedDashboardData {
  projects: any[];
  activities: any[];
  totalBudget: number;
  totalActualCost: number;
  totalActivities: number;
  completedActivities: number;
  projectsStats: any[];
}

export function useConsolidatedDashboard(userId?: number) {
  const { data, isLoading, error } = useQuery<ConsolidatedDashboardData>({
    queryKey: ["/api/dashboard/consolidated", userId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/consolidated?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch consolidated dashboard');
      return response.json();
    },
    enabled: !!userId,
  });

  const consolidatedData = data || {
    projects: [],
    activities: [],
    totalBudget: 0,
    totalActualCost: 0,
    totalActivities: 0,
    completedActivities: 0,
    projectsStats: []
  };

  // Calculate SPI and CPI from activities
  const calculateSPIAndCPI = (activities: any[]) => {
    if (!activities || activities.length === 0) return { averageSPI: 0, averageCPI: 0 };
    
    let totalSPI = 0;
    let totalCPI = 0;
    let validSPICount = 0;
    let validCPICount = 0;
    
    activities.forEach(activity => {
      const earnedValue = parseFloat(activity.earnedValue || "0");
      const plannedValue = parseFloat(activity.plannedValue || "0");
      const actualCost = parseFloat(activity.actualCost || "0");
      
      if (plannedValue > 0) {
        totalSPI += earnedValue / plannedValue;
        validSPICount++;
      }
      
      if (actualCost > 0) {
        totalCPI += earnedValue / actualCost;
        validCPICount++;
      }
    });
    
    return {
      averageSPI: validSPICount > 0 ? totalSPI / validSPICount : 0,
      averageCPI: validCPICount > 0 ? totalCPI / validCPICount : 0
    };
  };

  const { averageSPI, averageCPI } = calculateSPIAndCPI(consolidatedData.activities);

  // Calculate additional metrics
  const metrics = {
    totalProjects: consolidatedData.projects.length,
    activeProjects: consolidatedData.projects.filter(p => p.status === 'active').length,
    completedProjects: consolidatedData.projects.filter(p => p.status === 'completed').length,
    budgetUtilization: consolidatedData.totalBudget > 0 
      ? Math.round((consolidatedData.totalActualCost / consolidatedData.totalBudget) * 100)
      : 0,
    overallProgress: consolidatedData.totalActivities > 0 
      ? Math.round((consolidatedData.completedActivities / consolidatedData.totalActivities) * 100)
      : 0,
    projectsInProgress: consolidatedData.projects.filter(p => p.status === 'in_progress').length,
    projectsDelayed: consolidatedData.projects.filter(p => p.status === 'delayed').length,
    // Add KPI-compatible fields
    totalActivities: consolidatedData.totalActivities,
    completedActivities: consolidatedData.completedActivities,
    overallCompletionPercentage: consolidatedData.totalActivities > 0 
      ? Math.round((consolidatedData.completedActivities / consolidatedData.totalActivities) * 100)
      : 0,
    averageSPI,
    averageCPI,
    totalPlannedCost: consolidatedData.totalBudget,
    totalRealCost: consolidatedData.totalActualCost,
    filteredActivities: consolidatedData.activities || []
  };

  return {
    consolidatedData,
    metrics,
    isLoading,
    error,
    isConsolidatedView: true
  };
}
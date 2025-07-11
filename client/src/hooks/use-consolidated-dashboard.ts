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
    queryKey: ["/api/dashboard/consolidated", { userId }],
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
  };

  return {
    consolidatedData,
    metrics,
    isLoading,
    error,
    isConsolidatedView: true
  };
}
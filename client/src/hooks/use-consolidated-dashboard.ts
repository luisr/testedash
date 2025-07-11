import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export interface ConsolidatedData {
  activities: any[];
  projects: any[];
  users: any[];
  dashboards: any[];
}

export interface ConsolidatedMetrics {
  totalProjects: number;
  totalActivities: number;
  totalUsers: number;
  totalBudget: number;
  completionRate: number;
  averageSPI: number;
  averageCPI: number;
}

export function useConsolidatedDashboard(userId?: number) {
  const { user } = useAuth();
  
  const { data: consolidatedData, isLoading, error } = useQuery({
    queryKey: ['consolidated-dashboard', userId],
    queryFn: async () => {
      const response = await fetch(`/api/consolidated-dashboard/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch consolidated dashboard');
      }
      return response.json();
    },
    enabled: !!userId && !!user?.isSuperUser,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate metrics from consolidated data
  const metrics: ConsolidatedMetrics = {
    totalProjects: consolidatedData?.projects?.length || 0,
    totalActivities: consolidatedData?.activities?.length || 0,
    totalUsers: consolidatedData?.users?.length || 0,
    totalBudget: consolidatedData?.projects?.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) || 0,
    completionRate: consolidatedData?.activities?.length 
      ? (consolidatedData.activities.filter((a: any) => a.status === 'completed').length / consolidatedData.activities.length) * 100
      : 0,
    averageSPI: consolidatedData?.activities?.length
      ? consolidatedData.activities.reduce((sum: number, a: any) => sum + (a.spi || 1), 0) / consolidatedData.activities.length
      : 1,
    averageCPI: consolidatedData?.activities?.length
      ? consolidatedData.activities.reduce((sum: number, a: any) => sum + (a.cpi || 1), 0) / consolidatedData.activities.length
      : 1,
  };

  return {
    consolidatedData: consolidatedData || { activities: [], projects: [], users: [], dashboards: [] },
    metrics,
    isLoading,
    error,
  };
}
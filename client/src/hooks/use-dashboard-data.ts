import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dashboard, 
  Activity, 
  Project, 
  ActivityLog, 
  CustomColumn, 
  CustomChart,
  InsertActivity,
  InsertDashboardShare
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useDashboardData(dashboardId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch dashboard
  const { data: dashboard, isLoading: dashboardLoading } = useQuery<Dashboard>({
    queryKey: ["/api/dashboards", dashboardId],
    enabled: !!dashboardId,
  });

  // Fetch activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities/dashboard", dashboardId],
    enabled: !!dashboardId,
  });

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects/dashboard", dashboardId],
    enabled: !!dashboardId,
  });

  // Fetch custom columns
  const { data: customColumns = [], isLoading: columnsLoading } = useQuery<CustomColumn[]>({
    queryKey: ["/api/custom-columns", dashboardId],
    enabled: !!dashboardId,
  });

  // Fetch custom charts
  const { data: customCharts = [], isLoading: chartsLoading } = useQuery<CustomChart[]>({
    queryKey: ["/api/custom-charts", dashboardId],
    enabled: !!dashboardId,
  });

  // Fetch activity logs
  const { data: activityLogs = [], isLoading: logsLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs", dashboardId],
    enabled: !!dashboardId,
  });

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (activityData: InsertActivity) => {
      const response = await apiRequest("POST", "/api/activities", activityData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities/dashboard", dashboardId] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs", dashboardId] });
      toast({
        title: "Atividade criada",
        description: "A atividade foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar atividade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update activity mutation
  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Activity> }) => {
      const response = await apiRequest("PUT", `/api/activities/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities/dashboard", dashboardId] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs", dashboardId] });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-kpis", dashboardId] });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-charts", dashboardId] });
      toast({
        title: "Atividade atualizada",
        description: "A atividade foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar atividade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/activities/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities/dashboard", dashboardId] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs", dashboardId] });
      toast({
        title: "Atividade excluída",
        description: "A atividade foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir atividade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Share dashboard mutation
  const shareDashboardMutation = useMutation({
    mutationFn: async (shareData: { email: string; permission: string; notify: boolean }) => {
      const response = await apiRequest("POST", "/api/dashboard-shares", {
        dashboardId,
        userId: 1, // TODO: Get actual user ID
        sharedById: 1, // TODO: Get actual user ID
        permission: shareData.permission,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs", dashboardId] });
      toast({
        title: "Dashboard compartilhado",
        description: "O dashboard foi compartilhado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao compartilhar dashboard",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = dashboardLoading || activitiesLoading || projectsLoading || columnsLoading || chartsLoading || logsLoading;
  const error = null; // TODO: Handle errors properly

  return {
    dashboard,
    activities,
    projects,
    customColumns,
    customCharts,
    activityLogs,
    isLoading,
    error,
    createActivity: createActivityMutation.mutate,
    updateActivity: async (id: number, data: Partial<Activity>) => {
      console.log('Updating activity:', id, data);
      return updateActivityMutation.mutateAsync({ id, data });
    },
    deleteActivity: deleteActivityMutation.mutate,
    shareDashboard: shareDashboardMutation.mutate,
  };
}

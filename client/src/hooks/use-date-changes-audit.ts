import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { DateChangesAudit, InsertDateChangesAudit } from "@shared/schema";

export function useDateChangesAudit(dashboardId: number, activityId?: number) {
  const queryKey = activityId 
    ? ['/api/date-changes-audit', dashboardId, activityId]
    : ['/api/date-changes-audit', dashboardId];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<DateChangesAudit[]> => {
      const params = new URLSearchParams();
      if (activityId) {
        params.append('activityId', activityId.toString());
      }
      
      const response = await fetch(`/api/date-changes-audit/${dashboardId}?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch date changes audit');
      }
      return response.json();
    },
  });
}

export function useCreateDateChangesAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (audit: InsertDateChangesAudit): Promise<DateChangesAudit> => {
      return apiRequest('/api/date-changes-audit', {
        method: 'POST',
        body: audit,
      });
    },
    onSuccess: (newAudit) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['/api/date-changes-audit', newAudit.dashboardId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/date-changes-audit', newAudit.dashboardId, newAudit.activityId] 
      });
    },
  });
}

export function useUpdateActivityWithAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      activityId: number;
      activityData: any;
      userId: number;
      justification: string;
      changeReason?: string;
      impactDescription?: string;
    }) => {
      return apiRequest(`/api/activities/${params.activityId}/with-audit`, {
        method: 'PATCH',
        body: {
          activityData: params.activityData,
          userId: params.userId,
          justification: params.justification,
          changeReason: params.changeReason,
          impactDescription: params.impactDescription,
        },
      });
    },
    onSuccess: (updatedActivity, params) => {
      // Invalidate apenas as queries específicas relacionadas ao dashboard
      queryClient.invalidateQueries({ 
        queryKey: ['/api/activities/dashboard', updatedActivity.dashboardId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/date-changes-audit', updatedActivity.dashboardId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/activity-logs', updatedActivity.dashboardId] 
      });
    },
  });
}

// Helper function to detect date changes
export function detectDateChanges(
  oldActivity: any,
  newActivity: any
): { field: string; oldValue: Date | null; newValue: Date | null }[] {
  const dateFields = ['plannedStartDate', 'plannedEndDate', 'actualStartDate', 'actualEndDate'];
  const changes: { field: string; oldValue: Date | null; newValue: Date | null }[] = [];

  for (const field of dateFields) {
    const oldValue = oldActivity[field] ? new Date(oldActivity[field]) : null;
    const newValue = newActivity[field] ? new Date(newActivity[field]) : null;

    // Check if dates are different
    if (oldValue?.getTime() !== newValue?.getTime()) {
      changes.push({
        field,
        oldValue,
        newValue,
      });
    }
  }

  return changes;
}

// Helper function to format date change reason
export function formatChangeReason(reason: string): string {
  const reasons: Record<string, string> = {
    client_request: 'Solicitação do Cliente',
    resource_availability: 'Disponibilidade de Recursos',
    technical_issue: 'Problema Técnico',
    scope_change: 'Mudança no Escopo',
    dependency_change: 'Alteração de Dependência',
    risk_mitigation: 'Mitigação de Riscos',
    other: 'Outro'
  };

  return reasons[reason] || reason;
}
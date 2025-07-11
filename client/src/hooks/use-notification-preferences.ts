import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { NotificationPreferences, InsertNotificationPreferences } from "@shared/schema";

export function useNotificationPreferences(userId: number) {
  const queryClient = useQueryClient();

  // Fetch notification preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["notification-preferences", userId],
    queryFn: async () => {
      const response = await apiRequest({
        url: `/api/notification-preferences/${userId}`,
        method: "GET",
      });
      return response.data as NotificationPreferences;
    },
    enabled: !!userId,
  });

  // Update notification preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferencesData: Partial<InsertNotificationPreferences>) => {
      const response = await apiRequest({
        url: `/api/notification-preferences/${userId}`,
        method: "PUT",
        data: preferencesData,
      });
      return response.data as NotificationPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences", userId] });
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  };
}
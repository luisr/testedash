import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Notification, InsertNotification } from "@shared/schema";

export function useNotifications(userId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch all notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const response = await apiRequest({
        url: `/api/notifications/${userId}`,
        method: "GET",
      });
      return response.data as Notification[];
    },
    enabled: !!userId,
  });

  // Fetch unread notifications
  const { data: unreadNotifications } = useQuery({
    queryKey: ["notifications", "unread", userId],
    queryFn: async () => {
      const response = await apiRequest({
        url: `/api/notifications/unread/${userId}`,
        method: "GET",
      });
      return response.data as Notification[];
    },
    enabled: !!userId,
    onSuccess: (data) => {
      setUnreadCount(data?.length || 0);
    },
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async (notificationData: InsertNotification) => {
      const response = await apiRequest({
        url: "/api/notifications",
        method: "POST",
        data: notificationData,
      });
      return response.data as Notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest({
        url: `/api/notifications/${notificationId}/read`,
        method: "PUT",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest({
        url: `/api/notifications/mark-all-read/${userId}`,
        method: "PUT",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setUnreadCount(0);
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest({
        url: `/api/notifications/${notificationId}`,
        method: "DELETE",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Update unread count when notifications change
  useEffect(() => {
    if (unreadNotifications) {
      setUnreadCount(unreadNotifications.length);
    }
  }, [unreadNotifications]);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    createNotification: createNotificationMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isCreating: createNotificationMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
}

export function useWebSocketNotifications(userId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${userId}`;
    
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification') {
          const notification = data.notification as Notification;
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
            variant: "default",
          });
          
          // Update notifications cache
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [userId, queryClient, toast]);

  return {
    isConnected,
    ws,
  };
}
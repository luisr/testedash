import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDate } from "@/lib/utils";
import { Check, CheckCheck, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@shared/schema";

interface NotificationListProps {
  userId: number;
  onClose: () => void;
}

export function NotificationList({ userId, onClose }: NotificationListProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(userId);

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (notificationId: number) => {
    deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "activity_update":
        return "📝";
      case "project_status":
        return "📊";
      case "dashboard_share":
        return "🔗";
      case "deadline_reminder":
        return "⏰";
      case "system":
        return "🔔";
      default:
        return "📬";
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "activity_update":
        return "Atualização de Atividade";
      case "project_status":
        return "Status do Projeto";
      case "dashboard_share":
        return "Compartilhamento";
      case "deadline_reminder":
        return "Lembrete de Prazo";
      case "system":
        return "Sistema";
      default:
        return "Notificação";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notificações</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Notificações</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {!notifications || notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma notificação encontrada</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  onDelete={() => handleDelete(notification.id)}
                  getNotificationIcon={getNotificationIcon}
                  getNotificationTypeLabel={getNotificationTypeLabel}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
  getNotificationIcon: (type: string) => string;
  getNotificationTypeLabel: (type: string) => string;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  getNotificationIcon,
  getNotificationTypeLabel,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        "p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors",
        !notification.read && "bg-blue-50 dark:bg-blue-950/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {getNotificationTypeLabel(notification.type)}
            </Badge>
            {!notification.read && (
              <Badge variant="secondary" className="text-xs">
                Nova
              </Badge>
            )}
          </div>
          <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {formatDate(notification.createdAt.toString())}
            </span>
            <div className="flex items-center gap-1">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAsRead}
                  className="h-6 w-6 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  userId: number;
  onClick: () => void;
  className?: string;
}

export function NotificationBell({ userId, onClick, className }: NotificationBellProps) {
  const { unreadCount } = useNotifications(userId);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={cn(
          "relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800",
          className
        )}
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 text-blue-600" />
        ) : (
          <Bell className="h-5 w-5 text-gray-500" />
        )}
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-5 w-5 justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}
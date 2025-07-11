import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationBell } from "./notification-bell";
import { NotificationList } from "./notification-list";

interface NotificationPopupProps {
  userId: number;
  className?: string;
}

export function NotificationPopup({ userId, className }: NotificationPopupProps) {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <NotificationBell
            userId={userId}
            onClick={() => setOpen(!open)}
            className={className}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <NotificationList userId={userId} onClose={handleClose} />
      </PopoverContent>
    </Popover>
  );
}
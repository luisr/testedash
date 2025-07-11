import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Edit, Check, Share, Plus, Trash } from "lucide-react";
import { ActivityLog } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ActivityLogPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
}

export default function ActivityLogPanel({ isOpen, onClose, logs }: ActivityLogPanelProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Plus className="w-4 h-4 text-blue-600" />;
      case "update":
        return <Edit className="w-4 h-4 text-blue-600" />;
      case "delete":
        return <Trash className="w-4 h-4 text-red-600" />;
      case "share":
        return <Share className="w-4 h-4 text-purple-600" />;
      default:
        return <Edit className="w-4 h-4 text-blue-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-blue-100 dark:bg-blue-900/20";
      case "update":
        return "bg-blue-100 dark:bg-blue-900/20";
      case "delete":
        return "bg-red-100 dark:bg-red-900/20";
      case "share":
        return "bg-purple-100 dark:bg-purple-900/20";
      default:
        return "bg-blue-100 dark:bg-blue-900/20";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `Há ${diffInMinutes} minutos`;
    if (diffInMinutes < 1440) return `Há ${Math.floor(diffInMinutes / 60)} horas`;
    return `Há ${Math.floor(diffInMinutes / 1440)} dias`;
  };

  const getActionText = (log: ActivityLog) => {
    const details = log.details as any || {};
    
    switch (log.action) {
      case "create":
        return `criou ${log.entityType === "activity" ? "a atividade" : "o projeto"} "${details.name}"`;
      case "update":
        return `editou ${log.entityType === "activity" ? "a atividade" : "o projeto"} "${details.name}"`;
      case "delete":
        return `excluiu ${log.entityType === "activity" ? "a atividade" : "o projeto"} "${details.name}"`;
      case "share":
        return `compartilhou o dashboard com ${details.email || "um usuário"}`;
      default:
        return `realizou uma ação em ${log.entityType}`;
    }
  };

  return (
    <div className={cn(
      "fixed right-0 top-0 h-full w-96 bg-card shadow-xl transform transition-transform duration-300 ease-in-out z-40",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <Card className="h-full rounded-none border-l">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>Logs de Atividade</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 space-y-4 overflow-y-auto h-full">
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum log de atividade encontrado</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    getActionColor(log.action)
                  )}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Usuário {log.userId}</span>{" "}
                      {getActionText(log)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(log.timestamp!)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

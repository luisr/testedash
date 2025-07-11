import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferencesDialogProps {
  userId: number;
  trigger?: React.ReactNode;
}

export function NotificationPreferencesDialog({ userId, trigger }: NotificationPreferencesDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { preferences, updatePreferences, isUpdating } = useNotificationPreferences(userId);

  const handleToggle = (key: string, value: boolean) => {
    updatePreferences({ [key]: value });
    toast({
      title: "Preferências atualizadas",
      description: "Suas preferências de notificação foram salvas.",
    });
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Settings className="h-4 w-4 mr-2" />
      Configurar Notificações
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Preferências de Notificação</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notificações por Email</CardTitle>
              <CardDescription>
                Configure quando você deseja receber notificações por email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-activity">Atualizações de Atividade</Label>
                <Switch
                  id="email-activity"
                  checked={preferences?.emailActivityUpdates ?? true}
                  onCheckedChange={(checked) => handleToggle('emailActivityUpdates', checked)}
                  disabled={isUpdating}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-project">Status do Projeto</Label>
                <Switch
                  id="email-project"
                  checked={preferences?.emailProjectStatus ?? true}
                  onCheckedChange={(checked) => handleToggle('emailProjectStatus', checked)}
                  disabled={isUpdating}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-deadline">Lembretes de Prazo</Label>
                <Switch
                  id="email-deadline"
                  checked={preferences?.emailDeadlineReminders ?? true}
                  onCheckedChange={(checked) => handleToggle('emailDeadlineReminders', checked)}
                  disabled={isUpdating}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-share">Compartilhamentos</Label>
                <Switch
                  id="email-share"
                  checked={preferences?.emailDashboardShares ?? true}
                  onCheckedChange={(checked) => handleToggle('emailDashboardShares', checked)}
                  disabled={isUpdating}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-system">Notificações do Sistema</Label>
                <Switch
                  id="email-system"
                  checked={preferences?.emailSystemNotifications ?? true}
                  onCheckedChange={(checked) => handleToggle('emailSystemNotifications', checked)}
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notificações Push</CardTitle>
              <CardDescription>
                Configure quando você deseja receber notificações push no navegador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-activity">Atualizações de Atividade</Label>
                <Switch
                  id="push-activity"
                  checked={preferences?.pushActivityUpdates ?? true}
                  onCheckedChange={(checked) => handleToggle('pushActivityUpdates', checked)}
                  disabled={isUpdating}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-project">Status do Projeto</Label>
                <Switch
                  id="push-project"
                  checked={preferences?.pushProjectStatus ?? true}
                  onCheckedChange={(checked) => handleToggle('pushProjectStatus', checked)}
                  disabled={isUpdating}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-deadline">Lembretes de Prazo</Label>
                <Switch
                  id="push-deadline"
                  checked={preferences?.pushDeadlineReminders ?? true}
                  onCheckedChange={(checked) => handleToggle('pushDeadlineReminders', checked)}
                  disabled={isUpdating}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-share">Compartilhamentos</Label>
                <Switch
                  id="push-share"
                  checked={preferences?.pushDashboardShares ?? true}
                  onCheckedChange={(checked) => handleToggle('pushDashboardShares', checked)}
                  disabled={isUpdating}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-system">Notificações do Sistema</Label>
                <Switch
                  id="push-system"
                  checked={preferences?.pushSystemNotifications ?? true}
                  onCheckedChange={(checked) => handleToggle('pushSystemNotifications', checked)}
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
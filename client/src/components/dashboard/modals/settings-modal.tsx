import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, User, Bell, Shield, Palette, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: number;
}

export function SettingsModal({ isOpen, onClose, dashboardId }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      taskReminders: true,
      projectUpdates: true,
    },
    appearance: {
      theme: "auto",
      compactMode: false,
      showAnimations: true,
    },
    privacy: {
      profileVisible: true,
      activityTracking: true,
      dataCollection: false,
    },
    system: {
      autoBackup: true,
      backupFrequency: "daily",
      dataRetention: "1year",
    },
  });

  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacidade
            </TabsTrigger>
            <TabsTrigger value="system">
              <Database className="h-4 w-4 mr-2" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 max-h-[400px] overflow-y-auto beachpark-scrollbar">
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preferências de Notificação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações importantes por email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações no navegador
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, push: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="task-reminders">Lembretes de Tarefas</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber lembretes de prazos próximos
                      </p>
                    </div>
                    <Switch
                      id="task-reminders"
                      checked={settings.notifications.taskReminders}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, taskReminders: checked }
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personalização da Interface</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-mode">Modo Compacto</Label>
                      <p className="text-sm text-muted-foreground">
                        Interface mais compacta com menos espaçamento
                      </p>
                    </div>
                    <Switch
                      id="compact-mode"
                      checked={settings.appearance.compactMode}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, compactMode: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-animations">Animações</Label>
                      <p className="text-sm text-muted-foreground">
                        Exibir animações e transições suaves
                      </p>
                    </div>
                    <Switch
                      id="show-animations"
                      checked={settings.appearance.showAnimations}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          appearance: { ...prev.appearance, showAnimations: checked }
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurações de Privacidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profile-visible">Perfil Visível</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir que outros usuários vejam seu perfil
                      </p>
                    </div>
                    <Switch
                      id="profile-visible"
                      checked={settings.privacy.profileVisible}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, profileVisible: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="activity-tracking">Rastreamento de Atividade</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir coleta de dados de uso para melhorias
                      </p>
                    </div>
                    <Switch
                      id="activity-tracking"
                      checked={settings.privacy.activityTracking}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, activityTracking: checked }
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurações do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-backup">Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Criar backups automáticos dos dados
                      </p>
                    </div>
                    <Switch
                      id="auto-backup"
                      checked={settings.system.autoBackup}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          system: { ...prev.system, autoBackup: checked }
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSettings} className="beachpark-btn-primary">
              Salvar Configurações
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
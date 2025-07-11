import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Clock, 
  Download, 
  Upload, 
  Plus, 
  Settings, 
  Calendar,
  Database,
  History,
  Play,
  Pause,
  Trash2,
  CheckCircle,
  AlertCircle,
  Archive
} from 'lucide-react';

interface BackupManagementProps {
  dashboardId: number;
  userId: number;
}

interface BackupSchedule {
  id: number;
  dashboardId: number;
  userId: number;
  scheduleType: string;
  frequency: number;
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  maxBackups: number;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
}

interface DashboardBackup {
  id: number;
  dashboardId: number;
  userId: number;
  type: string;
  description?: string;
  fileSize?: number;
  checksum?: string;
  isRestorable: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

interface DashboardVersion {
  id: number;
  dashboardId: number;
  version: string;
  versionName?: string;
  changeType: string;
  releaseNotes?: string;
  isActive: boolean;
  isDraft: boolean;
  createdAt: Date;
  publishedAt?: Date;
}

export default function BackupManagement({ dashboardId, userId }: BackupManagementProps) {
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [backups, setBackups] = useState<DashboardBackup[]>([]);
  const [versions, setVersions] = useState<DashboardVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewScheduleDialog, setShowNewScheduleDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const { toast } = useToast();

  const [newSchedule, setNewSchedule] = useState({
    scheduleType: 'daily',
    frequency: 1,
    time: '02:00',
    dayOfWeek: 0,
    dayOfMonth: 1,
    maxBackups: 10
  });

  const [newBackup, setNewBackup] = useState({
    description: ''
  });

  const [newVersion, setNewVersion] = useState({
    versionName: '',
    changeType: 'patch',
    releaseNotes: ''
  });

  useEffect(() => {
    loadData();
  }, [dashboardId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSchedules(),
        loadBackups(),
        loadVersions()
      ]);
    } catch (error) {
      console.error('Error loading backup data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de backup",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const response = await fetch(`/api/backup-schedules/${dashboardId}`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const loadBackups = async () => {
    try {
      const response = await fetch(`/api/dashboard-backups/${dashboardId}`);
      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      }
    } catch (error) {
      console.error('Error loading backups:', error);
    }
  };

  const loadVersions = async () => {
    try {
      const response = await fetch(`/api/dashboard-versions/${dashboardId}`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const createSchedule = async () => {
    try {
      const response = await fetch('/api/backup-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSchedule,
          dashboardId,
          userId
        })
      });

      if (response.ok) {
        await loadSchedules();
        setShowNewScheduleDialog(false);
        setNewSchedule({
          scheduleType: 'daily',
          frequency: 1,
          time: '02:00',
          dayOfWeek: 0,
          dayOfMonth: 1,
          maxBackups: 10
        });
        toast({
          title: "Sucesso",
          description: "Agendamento de backup criado com sucesso"
        });
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar agendamento",
        variant: "destructive"
      });
    }
  };

  const createManualBackup = async () => {
    try {
      const response = await fetch('/api/dashboard-backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId,
          userId,
          type: 'manual',
          description: newBackup.description || 'Backup manual'
        })
      });

      if (response.ok) {
        await loadBackups();
        setShowBackupDialog(false);
        setNewBackup({ description: '' });
        toast({
          title: "Sucesso",
          description: "Backup criado com sucesso"
        });
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar backup",
        variant: "destructive"
      });
    }
  };

  const createVersion = async () => {
    try {
      const response = await fetch('/api/dashboard-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId,
          changedBy: userId,
          ...newVersion
        })
      });

      if (response.ok) {
        await loadVersions();
        setShowVersionDialog(false);
        setNewVersion({
          versionName: '',
          changeType: 'patch',
          releaseNotes: ''
        });
        toast({
          title: "Sucesso",
          description: "Versão criada com sucesso"
        });
      }
    } catch (error) {
      console.error('Error creating version:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar versão",
        variant: "destructive"
      });
    }
  };

  const toggleSchedule = async (scheduleId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/backup-schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        await loadSchedules();
        toast({
          title: "Sucesso",
          description: `Agendamento ${!isActive ? 'ativado' : 'desativado'} com sucesso`
        });
      }
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar agendamento",
        variant: "destructive"
      });
    }
  };

  const restoreBackup = async (backupId: number) => {
    try {
      const response = await fetch(`/api/dashboard-backups/${backupId}/restore`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Dashboard restaurado com sucesso"
        });
        // Reload page to reflect changes
        window.location.reload();
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast({
        title: "Erro",
        description: "Falha ao restaurar backup",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getScheduleDescription = (schedule: BackupSchedule) => {
    let desc = `A cada ${schedule.frequency} ${schedule.scheduleType === 'daily' ? 'dia(s)' : 
      schedule.scheduleType === 'weekly' ? 'semana(s)' : 'mês(es)'}`;
    
    if (schedule.time) {
      desc += ` às ${schedule.time}`;
    }
    
    return desc;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Backup e Versionamento
        </h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewScheduleDialog(true)}>
            <Clock className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
          <Button variant="outline" onClick={() => setShowBackupDialog(true)}>
            <Archive className="w-4 h-4 mr-2" />
            Backup Manual
          </Button>
          <Button variant="outline" onClick={() => setShowVersionDialog(true)}>
            <Database className="w-4 h-4 mr-2" />
            Nova Versão
          </Button>
        </div>
      </div>

      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedules">Agendamentos</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="versions">Versões</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Agendamentos Automáticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum agendamento configurado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map(schedule => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={schedule.isActive ? "default" : "secondary"}>
                            {schedule.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <span className="font-medium">{getScheduleDescription(schedule)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Máximo: {schedule.maxBackups} backups</span>
                          {schedule.lastRun && (
                            <span>Último: {formatDate(schedule.lastRun)}</span>
                          )}
                          {schedule.nextRun && (
                            <span>Próximo: {formatDate(schedule.nextRun)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSchedule(schedule.id, schedule.isActive)}
                        >
                          {schedule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* TODO: Delete schedule */}}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Backups Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum backup disponível</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backups.map(backup => (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={backup.type === 'manual' ? 'default' : 'secondary'}>
                            {backup.type === 'manual' ? 'Manual' : 'Automático'}
                          </Badge>
                          <span className="font-medium">{backup.description || 'Sem descrição'}</span>
                          {backup.isRestorable ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Tamanho: {formatFileSize(backup.fileSize)}</span>
                          <span>Criado: {formatDate(backup.createdAt)}</span>
                          {backup.expiresAt && (
                            <span>Expira: {formatDate(backup.expiresAt)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreBackup(backup.id)}
                          disabled={!backup.isRestorable}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Restaurar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* TODO: Download backup */}}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Versões do Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma versão disponível</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map(version => (
                    <div key={version.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={version.isActive ? 'default' : 'secondary'}>
                            v{version.version}
                          </Badge>
                          <span className="font-medium">{version.versionName || `Versão ${version.version}`}</span>
                          {version.isActive && (
                            <Badge variant="outline">Ativa</Badge>
                          )}
                          {version.isDraft && (
                            <Badge variant="outline">Rascunho</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Tipo: {version.changeType}</span>
                          <span>Criado: {formatDate(version.createdAt)}</span>
                          {version.publishedAt && (
                            <span>Publicado: {formatDate(version.publishedAt)}</span>
                          )}
                        </div>
                        {version.releaseNotes && (
                          <p className="text-sm text-muted-foreground">{version.releaseNotes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!version.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* TODO: Activate version */}}
                          >
                            Ativar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Schedule Dialog */}
      <Dialog open={showNewScheduleDialog} onOpenChange={setShowNewScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento de Backup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleType">Tipo de Agendamento</Label>
              <Select value={newSchedule.scheduleType} onValueChange={(value) => setNewSchedule({...newSchedule, scheduleType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Input
                id="frequency"
                type="number"
                value={newSchedule.frequency}
                onChange={(e) => setNewSchedule({...newSchedule, frequency: parseInt(e.target.value) || 1})}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxBackups">Máximo de Backups</Label>
              <Input
                id="maxBackups"
                type="number"
                value={newSchedule.maxBackups}
                onChange={(e) => setNewSchedule({...newSchedule, maxBackups: parseInt(e.target.value) || 10})}
                min="1"
                max="50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewScheduleDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createSchedule}>
              Criar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Backup Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Backup Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Input
                id="description"
                value={newBackup.description}
                onChange={(e) => setNewBackup({...newBackup, description: e.target.value})}
                placeholder="Descreva o propósito deste backup"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createManualBackup}>
              Criar Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Version Dialog */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Versão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="versionName">Nome da Versão</Label>
              <Input
                id="versionName"
                value={newVersion.versionName}
                onChange={(e) => setNewVersion({...newVersion, versionName: e.target.value})}
                placeholder="Ex: Versão com novas funcionalidades"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="changeType">Tipo de Alteração</Label>
              <Select value={newVersion.changeType} onValueChange={(value) => setNewVersion({...newVersion, changeType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="patch">Patch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseNotes">Notas da Versão</Label>
              <Input
                id="releaseNotes"
                value={newVersion.releaseNotes}
                onChange={(e) => setNewVersion({...newVersion, releaseNotes: e.target.value})}
                placeholder="Descreva as principais alterações"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createVersion}>
              Criar Versão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
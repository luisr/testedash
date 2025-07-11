import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock,
  Download,
  Upload,
  Archive,
  Settings,
  Trash2,
  Play,
  Pause,
  Calendar,
  FileText,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useBackupSystem } from '@/hooks/use-backup-system';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const scheduleSchema = z.object({
  scheduleType: z.enum(['daily', 'weekly', 'monthly']),
  frequency: z.number().min(1).max(30),
  time: z.string().optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  maxBackups: z.number().min(1).max(50).default(10),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface BackupManagerProps {
  dashboardId: number;
  userId: number;
  trigger: React.ReactNode;
}

export function BackupManager({ dashboardId, userId, trigger }: BackupManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('backups');
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  
  const {
    backups,
    versions,
    schedules,
    isLoading,
    isPending,
    createBackup,
    restoreBackup,
    deleteBackup,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    createVersion,
    activateVersion,
  } = useBackupSystem(dashboardId);

  const scheduleForm = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      scheduleType: 'daily',
      frequency: 1,
      maxBackups: 10,
    },
  });

  const handleCreateBackup = async () => {
    await createBackup.mutateAsync(userId);
  };

  const handleRestoreBackup = async (backupId: number) => {
    await restoreBackup.mutateAsync(backupId);
  };

  const handleDeleteBackup = async (backupId: number) => {
    await deleteBackup.mutateAsync(backupId);
  };

  const handleCreateSchedule = async (data: ScheduleFormData) => {
    await createSchedule.mutateAsync({
      userId,
      ...data,
    });
    setIsScheduleDialogOpen(false);
    scheduleForm.reset();
  };

  const handleToggleSchedule = async (scheduleId: number, isActive: boolean) => {
    await updateSchedule.mutateAsync({
      scheduleId,
      scheduleData: { isActive },
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case 'manual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'automatic':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getScheduleDescription = (schedule: any) => {
    const { scheduleType, frequency, time, dayOfWeek, dayOfMonth } = schedule;
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    let description = '';
    if (scheduleType === 'daily') {
      description = frequency === 1 ? 'Todos os dias' : `A cada ${frequency} dias`;
    } else if (scheduleType === 'weekly') {
      const dayName = dayOfWeek !== undefined ? days[dayOfWeek] : 'Domingo';
      description = frequency === 1 ? `Toda semana (${dayName})` : `A cada ${frequency} semanas (${dayName})`;
    } else if (scheduleType === 'monthly') {
      const dayStr = dayOfMonth ? `dia ${dayOfMonth}` : 'dia 1';
      description = frequency === 1 ? `Todo mês (${dayStr})` : `A cada ${frequency} meses (${dayStr})`;
    }
    
    if (time) {
      description += ` às ${time}`;
    }
    
    return description;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Gerenciamento de Backup e Versionamento
          </DialogTitle>
          <DialogDescription>
            Gerencie backups automáticos, versões e agendamentos do seu dashboard
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="backups" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Backups
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Versões
            </TabsTrigger>
            <TabsTrigger value="schedules" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agendamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="backups" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Backups do Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  {backups.length} backup(s) disponível(eis)
                </p>
              </div>
              <Button 
                onClick={handleCreateBackup}
                disabled={isPending || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Criar Backup
              </Button>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {backups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum backup encontrado</p>
                  <p className="text-sm">Crie seu primeiro backup clicando no botão acima</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {backups.map((backup) => (
                    <Card key={backup.id} className="transition-shadow hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge className={getBackupTypeColor(backup.backupType)}>
                                {backup.backupType === 'manual' ? 'Manual' : 
                                 backup.backupType === 'automatic' ? 'Automático' : 'Agendado'}
                              </Badge>
                              <span className="text-sm font-mono text-muted-foreground">
                                {backup.version}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restaurar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    Confirmar Restauração
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação irá restaurar o dashboard para o estado do backup selecionado.
                                    Todas as alterações feitas após este backup serão perdidas.
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRestoreBackup(backup.id)}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    Restaurar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Deletar Backup</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja deletar este backup? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteBackup(backup.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Deletar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Data de Criação</p>
                            <p className="font-medium">
                              {format(new Date(backup.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Tamanho</p>
                            <p className="font-medium">{formatFileSize(backup.fileSize)}</p>
                          </div>
                        </div>
                        {backup.description && (
                          <div className="mt-3">
                            <p className="text-muted-foreground text-sm">Descrição</p>
                            <p className="text-sm">{backup.description}</p>
                          </div>
                        )}
                        {backup.metadata && (
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>Atividades: {backup.metadata.totalActivities || 0}</div>
                            <div>Projetos: {backup.metadata.totalProjects || 0}</div>
                            <div>Colunas: {backup.metadata.totalCustomColumns || 0}</div>
                            <div>Gráficos: {backup.metadata.totalCustomCharts || 0}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="versions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Versões do Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  {versions.length} versão(ões) disponível(eis)
                </p>
              </div>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {versions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma versão encontrada</p>
                  <p className="text-sm">As versões são criadas automaticamente quando mudanças significativas são feitas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <Card key={version.id} className="transition-shadow hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge variant={version.isActive ? "default" : "secondary"}>
                                {version.isActive ? 'Ativa' : 'Inativa'}
                              </Badge>
                              <span className="font-mono text-sm">
                                {version.version}
                              </span>
                              {version.versionName && (
                                <span className="text-sm text-muted-foreground">
                                  ({version.versionName})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {version.changeType}
                            </Badge>
                            {!version.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => activateVersion.mutate(version.id)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Ativar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Data de Criação</p>
                            <p className="font-medium">
                              {format(new Date(version.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          {version.publishedAt && (
                            <div>
                              <p className="text-muted-foreground">Data de Publicação</p>
                              <p className="font-medium">
                                {format(new Date(version.publishedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                          )}
                        </div>
                        {version.releaseNotes && (
                          <div className="mt-3">
                            <p className="text-muted-foreground text-sm">Notas de Lançamento</p>
                            <p className="text-sm">{version.releaseNotes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Agendamentos de Backup</h3>
                <p className="text-sm text-muted-foreground">
                  {schedules.length} agendamento(s) configurado(s)
                </p>
              </div>
              <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Agendamento de Backup</DialogTitle>
                    <DialogDescription>
                      Configure quando e com que frequência os backups automáticos devem ser criados
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...scheduleForm}>
                    <form onSubmit={scheduleForm.handleSubmit(handleCreateSchedule)} className="space-y-4">
                      <FormField
                        control={scheduleForm.control}
                        name="scheduleType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Agendamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Diário</SelectItem>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="monthly">Mensal</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={scheduleForm.control}
                          name="frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequência</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="30"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={scheduleForm.control}
                          name="maxBackups"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Máximo de Backups</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="50"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={scheduleForm.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário (opcional)</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                          Criar Agendamento
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum agendamento configurado</p>
                  <p className="text-sm">Configure agendamentos automáticos para manter seus backups sempre atualizados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <Card key={schedule.id} className="transition-shadow hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge variant={schedule.isActive ? "default" : "secondary"}>
                                {schedule.isActive ? 'Ativo' : 'Inativo'}
                              </Badge>
                              <span className="text-sm font-medium">
                                {getScheduleDescription(schedule)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={schedule.isActive}
                              onCheckedChange={(checked) => handleToggleSchedule(schedule.id, checked)}
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Deletar Agendamento</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja deletar este agendamento? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteSchedule.mutate(schedule.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Deletar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Último Backup</p>
                            <p className="font-medium">
                              {schedule.lastRun 
                                ? format(new Date(schedule.lastRun), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                                : 'Nunca executado'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Próximo Backup</p>
                            <p className="font-medium">
                              {schedule.nextRun 
                                ? format(new Date(schedule.nextRun), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                                : 'Não agendado'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 text-sm">
                          <p className="text-muted-foreground">Máximo de Backups</p>
                          <p className="font-medium">{schedule.maxBackups}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
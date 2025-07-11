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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Archive,
  Save,
  RotateCcw,
  AlertTriangle,
  Calendar,
  FileText,
  Trash2,
  Play,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface BackupSimpleProps {
  dashboardId: number;
  userId: number;
  trigger: React.ReactNode;
}

export function BackupSimple({ dashboardId, userId, trigger }: BackupSimpleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('backups');
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dashboard backups
  const { data: backups = [], isLoading: isLoadingBackups } = useQuery({
    queryKey: ['dashboards', dashboardId, 'backups'],
    queryFn: async () => {
      const response = await fetch(`/api/dashboards/${dashboardId}/backups`);
      if (!response.ok) throw new Error('Failed to fetch backups');
      return response.json();
    },
    enabled: isOpen,
  });

  // Fetch dashboard versions
  const { data: versions = [], isLoading: isLoadingVersions } = useQuery({
    queryKey: ['dashboards', dashboardId, 'versions'],
    queryFn: async () => {
      const response = await fetch(`/api/dashboards/${dashboardId}/versions`);
      if (!response.ok) throw new Error('Failed to fetch versions');
      return response.json();
    },
    enabled: isOpen,
  });

  // Create backup
  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const response = await fetch(`/api/dashboards/${dashboardId}/backups/auto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      const backup = await response.json();
      
      // Refresh backups list
      queryClient.invalidateQueries({ queryKey: ['dashboards', dashboardId, 'backups'] });
      
      toast({
        title: 'Backup criado com sucesso',
        description: `Backup ${backup.version} foi criado e está disponível para restauração.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar backup',
        description: 'Não foi possível criar o backup. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error creating backup:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Restore backup
  const handleRestoreBackup = async (backupId: number) => {
    setIsRestoring(true);
    try {
      const response = await fetch(`/api/backups/${backupId}/restore`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to restore backup');
      }

      // Refresh all dashboard data
      queryClient.invalidateQueries({ queryKey: ['dashboards', dashboardId] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'dashboard', dashboardId] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'dashboard', dashboardId] });
      queryClient.invalidateQueries({ queryKey: ['custom-columns', dashboardId] });
      queryClient.invalidateQueries({ queryKey: ['custom-charts', dashboardId] });
      
      toast({
        title: 'Backup restaurado com sucesso',
        description: 'O dashboard foi restaurado para o estado do backup selecionado.',
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Erro ao restaurar backup',
        description: 'Não foi possível restaurar o backup. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error restoring backup:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  // Delete backup
  const handleDeleteBackup = async (backupId: number) => {
    try {
      const response = await fetch(`/api/backups/${backupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete backup');
      }

      // Refresh backups list
      queryClient.invalidateQueries({ queryKey: ['dashboards', dashboardId, 'backups'] });
      
      toast({
        title: 'Backup deletado',
        description: 'O backup foi removido com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao deletar backup',
        description: 'Não foi possível deletar o backup. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error deleting backup:', error);
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Backup e Versionamento
          </DialogTitle>
          <DialogDescription>
            Gerencie backups e versões do seu dashboard
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="backups" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Backups
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Versões
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
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? 'Criando...' : 'Criar Backup'}
              </Button>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {isLoadingBackups ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando backups...</p>
                </div>
              ) : backups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum backup encontrado</p>
                  <p className="text-sm">Crie seu primeiro backup clicando no botão acima</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {backups.map((backup: any) => (
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
                                <Button variant="outline" size="sm" disabled={isRestoring}>
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
                              {backup.createdAt ? format(new Date(backup.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}
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
              {isLoadingVersions ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando versões...</p>
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma versão encontrada</p>
                  <p className="text-sm">As versões são criadas automaticamente quando mudanças significativas são feitas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((version: any) => (
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
                            {version.isActive && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Data de Criação</p>
                            <p className="font-medium">
                              {version.createdAt ? format(new Date(version.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
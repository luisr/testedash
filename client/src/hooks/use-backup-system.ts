import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export interface DashboardBackup {
  id: number;
  dashboardId: number;
  userId: number;
  version: string;
  backupType: 'manual' | 'automatic' | 'scheduled';
  triggerEvent?: string;
  description?: string;
  fileSize?: number;
  checksum?: string;
  isRestorable: boolean;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: any;
}

export interface BackupSchedule {
  id: number;
  dashboardId: number;
  userId: number;
  scheduleType: 'daily' | 'weekly' | 'monthly';
  frequency: number;
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  maxBackups: number;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardVersion {
  id: number;
  dashboardId: number;
  parentVersionId?: number;
  version: string;
  versionName?: string;
  changes: any;
  changedBy: number;
  changeType: 'major' | 'minor' | 'patch';
  releaseNotes?: string;
  isActive: boolean;
  isDraft: boolean;
  createdAt: Date;
  publishedAt?: Date;
}

export function useBackupSystem(dashboardId: number) {
  const queryClient = useQueryClient();

  // Fetch dashboard backups
  const { data: backups, isLoading: isLoadingBackups } = useQuery({
    queryKey: ['dashboards', dashboardId, 'backups'],
    queryFn: async () => {
      const response = await fetch(`/api/dashboards/${dashboardId}/backups`);
      if (!response.ok) throw new Error('Failed to fetch backups');
      return response.json() as Promise<DashboardBackup[]>;
    },
  });

  // Fetch dashboard versions
  const { data: versions, isLoading: isLoadingVersions } = useQuery({
    queryKey: ['dashboards', dashboardId, 'versions'],
    queryFn: async () => {
      const response = await fetch(`/api/dashboards/${dashboardId}/versions`);
      if (!response.ok) throw new Error('Failed to fetch versions');
      return response.json() as Promise<DashboardVersion[]>;
    },
  });

  // Fetch backup schedules
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['dashboards', dashboardId, 'backup-schedules'],
    queryFn: async () => {
      const response = await fetch(`/api/dashboards/${dashboardId}/backup-schedules`);
      if (!response.ok) throw new Error('Failed to fetch backup schedules');
      return response.json() as Promise<BackupSchedule[]>;
    },
  });

  // Create automatic backup
  const createBackup = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/dashboards/${dashboardId}/backups/auto`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards', dashboardId, 'backups'] });
      toast({
        title: 'Backup criado com sucesso',
        description: 'O backup do dashboard foi criado automaticamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar backup',
        description: 'Ocorreu um erro ao criar o backup. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error creating backup:', error);
    },
  });

  // Restore backup
  const restoreBackup = useMutation({
    mutationFn: async (backupId: number) => {
      return await apiRequest(`/api/backups/${backupId}/restore`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards', dashboardId] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'dashboard', dashboardId] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'dashboard', dashboardId] });
      queryClient.invalidateQueries({ queryKey: ['custom-columns', dashboardId] });
      queryClient.invalidateQueries({ queryKey: ['custom-charts', dashboardId] });
      toast({
        title: 'Backup restaurado com sucesso',
        description: 'O dashboard foi restaurado para o estado do backup selecionado.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao restaurar backup',
        description: 'Ocorreu um erro ao restaurar o backup. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error restoring backup:', error);
    },
  });

  // Delete backup
  const deleteBackup = useMutation({
    mutationFn: async (backupId: number) => {
      return await apiRequest(`/api/backups/${backupId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards', dashboardId, 'backups'] });
      toast({
        title: 'Backup deletado',
        description: 'O backup foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao deletar backup',
        description: 'Ocorreu um erro ao deletar o backup. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error deleting backup:', error);
    },
  });

  // Create backup schedule
  const createSchedule = useMutation({
    mutationFn: async (scheduleData: {
      userId: number;
      scheduleType: 'daily' | 'weekly' | 'monthly';
      frequency: number;
      time?: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
      maxBackups: number;
    }) => {
      return await apiRequest(`/api/dashboards/${dashboardId}/backup-schedules`, {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards', dashboardId, 'backup-schedules'] });
      toast({
        title: 'Agendamento criado',
        description: 'O agendamento de backup foi criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar agendamento',
        description: 'Ocorreu um erro ao criar o agendamento. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error creating schedule:', error);
    },
  });

  // Update backup schedule
  const updateSchedule = useMutation({
    mutationFn: async ({ scheduleId, scheduleData }: {
      scheduleId: number;
      scheduleData: Partial<BackupSchedule>;
    }) => {
      return await apiRequest(`/api/backup-schedules/${scheduleId}`, {
        method: 'PUT',
        body: JSON.stringify(scheduleData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards', dashboardId, 'backup-schedules'] });
      toast({
        title: 'Agendamento atualizado',
        description: 'O agendamento de backup foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar agendamento',
        description: 'Ocorreu um erro ao atualizar o agendamento. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error updating schedule:', error);
    },
  });

  // Delete backup schedule
  const deleteSchedule = useMutation({
    mutationFn: async (scheduleId: number) => {
      return await apiRequest(`/api/backup-schedules/${scheduleId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards', dashboardId, 'backup-schedules'] });
      toast({
        title: 'Agendamento deletado',
        description: 'O agendamento de backup foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao deletar agendamento',
        description: 'Ocorreu um erro ao deletar o agendamento. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error deleting schedule:', error);
    },
  });

  // Create dashboard version
  const createVersion = useMutation({
    mutationFn: async (versionData: {
      changedBy: number;
      version: string;
      versionName?: string;
      changes: any;
      changeType: 'major' | 'minor' | 'patch';
      releaseNotes?: string;
    }) => {
      return await apiRequest(`/api/dashboards/${dashboardId}/versions`, {
        method: 'POST',
        body: JSON.stringify(versionData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards', dashboardId, 'versions'] });
      toast({
        title: 'Versão criada',
        description: 'A nova versão do dashboard foi criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar versão',
        description: 'Ocorreu um erro ao criar a versão. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error creating version:', error);
    },
  });

  // Activate version
  const activateVersion = useMutation({
    mutationFn: async (versionId: number) => {
      return await apiRequest(`/api/dashboards/${dashboardId}/versions/${versionId}/activate`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards', dashboardId, 'versions'] });
      toast({
        title: 'Versão ativada',
        description: 'A versão foi ativada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao ativar versão',
        description: 'Ocorreu um erro ao ativar a versão. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Error activating version:', error);
    },
  });

  return {
    // Data
    backups: backups || [],
    versions: versions || [],
    schedules: schedules || [],
    
    // Loading states
    isLoadingBackups,
    isLoadingVersions,
    isLoadingSchedules,
    
    // Mutations
    createBackup,
    restoreBackup,
    deleteBackup,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    createVersion,
    activateVersion,
    
    // Computed
    isLoading: isLoadingBackups || isLoadingVersions || isLoadingSchedules,
    isPending: createBackup.isPending || restoreBackup.isPending || deleteBackup.isPending ||
               createSchedule.isPending || updateSchedule.isPending || deleteSchedule.isPending ||
               createVersion.isPending || activateVersion.isPending,
  };
}
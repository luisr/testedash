import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useConsolidatedDashboard } from '@/hooks/use-consolidated-dashboard';
import { useActivityMetrics } from '@/hooks/use-activity-metrics';
import { useAuth } from '@/contexts/AuthContext';
import KPICards from './kpi-cards';
import ChartsSection from './charts-section';
import ActivityTable from './activity-table';
import ActivitiesPanel from './activities-panel';
import ActivitySummary from './activity-summary';
import ProjectViews from './project-views';
import AdvancedReports from './advanced-reports';
import BackupManagement from './backup-management';
import CreateActivityModal from './create-activity-modal';
import MilestoneManager from './milestone-manager';
import { Button } from '@/components/ui/button';
import { Activity } from '@shared/schema';

interface DashboardContentProps {
  dashboardId: number;
  isConsolidatedDashboard: boolean;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ 
  dashboardId, 
  isConsolidatedDashboard 
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterResponsible, setFilterResponsible] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);
  const [showMilestoneManager, setShowMilestoneManager] = useState(false);
  const [visibleFields, setVisibleFields] = useState<string[]>([
    // Campos padrão da tabela
    'name', 'status', 'priority', 'responsible', 'discipline', 'completionPercentage', 
    'plannedStartDate', 'actualStartDate', 'plannedFinishDate', 'actualFinishDate', 
    'plannedCost', 'actualCost', 'actions',
    // KPIs
    'kpi_progress', 'kpi_budget', 'kpi_performance', 'kpi_custom',
    // Gráficos
    'chart_progress', 'chart_status', 'chart_budget', 'chart_custom'
  ]);

  // Get dashboard data
  const regularDashboard = useDashboardData(dashboardId);
  const consolidatedDashboard = useConsolidatedDashboard(user?.id);

  // Check super user access for consolidated dashboard
  if (isConsolidatedDashboard && !user?.isSuperUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="mb-4">
            <span className="text-red-600 text-2xl">🚫</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar o dashboard consolidado. 
            Apenas super usuários podem visualizar dados consolidados.
          </p>
          <Button 
            onClick={() => window.location.href = '/dashboard/2'} 
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            Ir para Meu Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Select appropriate dashboard data
  const {
    dashboard,
    activities,
    projects,
    customColumns,
    customCharts,
    activityLogs,
    isLoading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
    shareDashboard
  } = isConsolidatedDashboard ? {
    dashboard: { id: 1, name: "Dashboard Principal", description: "Visão consolidada de todos os projetos" },
    activities: consolidatedDashboard.consolidatedData.activities || [],
    projects: consolidatedDashboard.consolidatedData.projects || [],
    customColumns: [],
    customCharts: [],
    activityLogs: [],
    isLoading: consolidatedDashboard.isLoading,
    error: consolidatedDashboard.error,
    createActivity: () => Promise.resolve({} as any),
    updateActivity: async (id: number, data: Partial<Activity>) => {
      console.log('Consolidated dashboard update activity:', id, data);
      // For consolidated dashboard, we'll make a direct API call
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update activity');
      }
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['/api/consolidated-dashboard', user?.id] });
      return response.json();
    },
    deleteActivity: () => Promise.resolve(false),
    shareDashboard: () => Promise.resolve({} as any)
  } : {
    ...regularDashboard,
    updateActivity: async (id: number, data: Partial<Activity>) => {
      console.log('Regular dashboard update activity:', id, data);
      await regularDashboard.updateActivity(id, data);
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: ['/api/activities/dashboard', dashboardId] });
    }
  };

  // Calculate metrics
  const metrics = isConsolidatedDashboard 
    ? consolidatedDashboard.metrics 
    : useActivityMetrics(
        activities,
        searchTerm,
        filterStatus,
        filterResponsible,
        startDate,
        endDate
      );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro ao carregar dashboard</h1>
          <p className="text-muted-foreground">{error?.message || String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KPICards 
        metrics={metrics}
        dashboardId={dashboardId}
        activities={activities}
        projects={projects}
        visibleFields={visibleFields}
        onKPIUpdate={() => {
          // Invalidar apenas as queries relacionadas aos KPIs
          queryClient.invalidateQueries({ queryKey: ['/api/custom-kpis', dashboardId] });
        }}
      />

      {/* Activity Summary */}
      <ActivitySummary 
        activities={activities} 
        onManageMilestones={() => setShowMilestoneManager(true)}
      />

      {/* Charts Section */}
      <ChartsSection 
        activities={activities}
        projects={projects}
        customCharts={customCharts}
        dashboardId={dashboardId}
        visibleFields={visibleFields}
        onChartsUpdate={() => {
          // Invalidar apenas as queries relacionadas aos gráficos
          queryClient.invalidateQueries({ queryKey: ['/api/custom-charts', dashboardId] });
        }}
      />

      {/* Activities Panel with Multiple Views */}
      <ActivitiesPanel 
        activities={activities}
        dashboardId={dashboardId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewActivity={() => setShowCreateActivityModal(true)}
        onUpdateActivity={updateActivity}
        onDeleteActivity={deleteActivity}
        onEditActivity={() => {}}
        onCreateSubActivity={() => {}}
        onBulkImport={() => {}}
        customColumns={customColumns}
        visibleFields={visibleFields}
        onVisibleFieldsChange={setVisibleFields}
      />

      {/* Project Views */}
      <ProjectViews 
        activities={activities}
        projects={projects}
        onUpdateActivity={updateActivity}
      />

      {/* Advanced Reports */}
      <AdvancedReports 
        activities={activities} 
        projects={projects}
        dashboardId={dashboardId}
      />

      {/* Backup Management - Only for regular dashboards */}
      {!isConsolidatedDashboard && (
        <BackupManagement 
          dashboardId={dashboardId}
          onBackupComplete={() => {
            // Invalidar apenas as queries relacionadas aos backups
            queryClient.invalidateQueries({ queryKey: ['/api/backups', dashboardId] });
          }}
        />
      )}

      {/* Modal para criar nova atividade */}
      <CreateActivityModal
        open={showCreateActivityModal}
        onClose={() => setShowCreateActivityModal(false)}
        dashboardId={dashboardId}
      />

      {/* Modal para gerenciar marcos */}
      <MilestoneManager
        open={showMilestoneManager}
        onClose={() => setShowMilestoneManager(false)}
        activities={activities}
        dashboardId={dashboardId}
      />
    </div>
  );
};
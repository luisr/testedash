import React, { useState } from 'react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useConsolidatedDashboard } from '@/hooks/use-consolidated-dashboard';
import { useActivityMetrics } from '@/hooks/use-activity-metrics';
import { useAuth } from '@/contexts/AuthContext';
import KPICards from './kpi-cards';
import ChartsSection from './charts-section';
import ActivityTable from './activity-table';
import ActivitiesPanel from './activities-panel';
import ProjectViews from './project-views';
import BackupManagement from './backup-management';
import { Button } from '@/components/ui/button';

interface DashboardContentProps {
  dashboardId: number;
  isConsolidatedDashboard: boolean;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ 
  dashboardId, 
  isConsolidatedDashboard 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterResponsible, setFilterResponsible] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Get dashboard data
  const regularDashboard = useDashboardData(dashboardId);
  const consolidatedDashboard = useConsolidatedDashboard(user?.id);

  // Debug logging
  console.log('DashboardContent - Props:', { dashboardId, isConsolidatedDashboard });
  console.log('DashboardContent - User:', user);
  console.log('DashboardContent - Regular Dashboard:', regularDashboard);
  console.log('DashboardContent - Consolidated Dashboard:', consolidatedDashboard);

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
    updateActivity: () => Promise.resolve({} as any),
    deleteActivity: () => Promise.resolve(false),
    shareDashboard: () => Promise.resolve({} as any)
  } : regularDashboard;

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
        onKPIUpdate={() => window.location.reload()}
      />

      {/* Charts Section */}
      <ChartsSection 
        activities={activities}
        projects={projects}
        customCharts={customCharts}
        dashboardId={dashboardId}
        onChartsUpdate={() => window.location.reload()}
      />

      {/* Activity Table */}
      <ActivityTable 
        activities={activities}
        customColumns={customColumns}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterResponsible={filterResponsible}
        onFilterResponsibleChange={setFilterResponsible}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onActivityUpdate={updateActivity}
        onActivityDelete={deleteActivity}
        onActivitiesImport={() => {}}
        onCustomColumnsUpdate={() => window.location.reload()}
        onExport={() => {}}
        dashboardId={dashboardId}
        isReadOnly={isConsolidatedDashboard}
      />

      {/* Additional Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivitiesPanel 
          activities={activities}
          onActivityUpdate={updateActivity}
          readOnly={isConsolidatedDashboard}
        />
        
        <ProjectViews 
          projects={projects}
          dashboardId={dashboardId}
          readOnly={isConsolidatedDashboard}
        />
      </div>

      {/* Backup Management - Only for regular dashboards */}
      {!isConsolidatedDashboard && (
        <BackupManagement 
          dashboardId={dashboardId}
          onBackupComplete={() => window.location.reload()}
        />
      )}
    </div>
  );
};
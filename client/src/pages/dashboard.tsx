import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useActivityMetrics } from "@/hooks/use-activity-metrics";
import { useNotifications, useWebSocketNotifications } from "@/hooks/use-notifications";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import KPICards from "@/components/dashboard/kpi-cards";
import ChartsSection from "@/components/dashboard/charts-section";
import ActivityTable from "@/components/dashboard/activity-table";
import ActivitiesPanel from "@/components/dashboard/activities-panel";
import ProjectViews from "@/components/dashboard/project-views";
import BackupManagement from "@/components/dashboard/backup-management";

import ShareModalEnhanced from "@/components/dashboard/share-modal-enhanced";
import ActivityLogPanel from "@/components/dashboard/activity-log-panel";
import ExportModal from "@/components/dashboard/export-modal";
import NewActivityModal from "@/components/dashboard/new-activity-modal";
import DependencyModal from "@/components/dashboard/dependency-modal";
import SimpleModal from "@/components/dashboard/simple-modal";
import { NotificationPopup } from "@/components/notifications/notification-popup";
import { NotificationPreferencesDialog } from "@/components/notifications/notification-preferences-dialog";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, Users, FileText, Upload, Archive } from "lucide-react";
import { BackupSimple } from "@/components/dashboard/backup-simple";
import { DependencyManager } from "@/components/dashboard/dependency-manager";
import { ActivityDateEditor } from "@/components/dashboard/activity-date-editor";
import { DateAuditViewer } from "@/components/dashboard/date-audit-viewer";
import { NewUserModal } from "@/components/dashboard/new-user-modal";
import { NewProjectModal } from "@/components/dashboard/new-project-modal";
import { UsersListModal } from "@/components/dashboard/users-list-modal";
import { ProjectsListModal } from "@/components/dashboard/projects-list-modal";

export default function Dashboard() {
  const { id } = useParams<{ id?: string }>();
  const dashboardId = id ? parseInt(id) : 1; // Default to dashboard 1
  const userId = 1; // TODO: Get from authentication
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [newActivityModalOpen, setNewActivityModalOpen] = useState(false);
  const [dependencyModalOpen, setDependencyModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'projects' | 'users' | 'reports' | 'import' | null>(null);
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [usersListModalOpen, setUsersListModalOpen] = useState(false);
  const [projectsListModalOpen, setProjectsListModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterResponsible, setFilterResponsible] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Initialize notifications and WebSocket
  const { createNotification } = useNotifications(userId);
  const { isConnected } = useWebSocketNotifications(userId);

  // Function to create notification when activities are updated
  const handleActivityUpdate = (activity: any, action: string) => {
    const notificationTypes = {
      create: { type: "activity_update", title: "Nova atividade criada", message: `A atividade "${activity.name}" foi criada.` },
      update: { type: "activity_update", title: "Atividade atualizada", message: `A atividade "${activity.name}" foi atualizada.` },
      delete: { type: "activity_update", title: "Atividade excluída", message: `A atividade "${activity.name}" foi excluída.` },
      status: { type: "activity_update", title: "Status alterado", message: `O status da atividade "${activity.name}" foi alterado para ${activity.status}.` }
    };

    const notification = notificationTypes[action as keyof typeof notificationTypes];
    if (notification) {
      createNotification({
        userId,
        dashboardId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: { activityId: activity.id, action }
      });
    }
  };

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
  } = useDashboardData(dashboardId);

  const metrics = useActivityMetrics(
    activities,
    searchTerm,
    filterStatus,
    filterResponsible,
    startDate,
    endDate
  );

  // Define available columns for export
  const availableColumns = [
    { key: 'name', label: 'Nome' },
    { key: 'description', label: 'Descrição' },
    { key: 'discipline', label: 'Disciplina' },
    { key: 'responsible', label: 'Responsável' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Prioridade' },
    { key: 'plannedStartDate', label: 'Data Início Planejada' },
    { key: 'plannedEndDate', label: 'Data Fim Planejada' },
    { key: 'actualStartDate', label: 'Data Início Real' },
    { key: 'actualEndDate', label: 'Data Fim Real' },
    { key: 'plannedValue', label: 'Valor Planejado' },
    { key: 'actualCost', label: 'Custo Real' },
    { key: 'earnedValue', label: 'Valor Agregado' },
    { key: 'completionPercentage', label: 'Percentual Conclusão' },
    { key: 'associatedRisk', label: 'Risco Associado' },
  ];

  // Export handler
  const handleExport = async (options: any) => {
    try {
      // Filter activities based on date range if specified
      let exportData = metrics.filteredActivities;
      
      if (options.dateRange) {
        const { start, end } = options.dateRange;
        exportData = exportData.filter(activity => {
          const startDate = new Date(activity.plannedStartDate || activity.actualStartDate || '');
          return startDate >= start && startDate <= end;
        });
      }

      // Filter columns based on selection
      const filteredData = exportData.map(activity => {
        const filtered: any = {};
        options.columns.forEach((col: string) => {
          if (col in activity) {
            filtered[col] = activity[col as keyof typeof activity];
          }
        });
        return filtered;
      });

      // Create export request
      const exportRequest = {
        data: filteredData,
        format: options.format,
        dashboardName: dashboard?.name || "Dashboard Principal",
        includeCharts: options.includeCharts,
        includeFilters: options.includeFilters,
        columns: options.columns,
        metrics: metrics
      };

      // Send to backend for processing
      const response = await fetch(`/api/export/dashboard/${dashboardId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportRequest),
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar dados');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${dashboard?.name || 'export'}-${new Date().toISOString().split('T')[0]}.${options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erro ao exportar:', error);
      // You can add toast notification here
    }
  };

  // Bulk import handler
  const handleBulkImport = async (activities: any[]) => {
    try {
      const importPromises = activities.map(activityData => 
        createActivity(activityData)
      );
      
      await Promise.all(importPromises);
      
      // Refresh the data
      window.location.reload();
      
      return { success: true, count: activities.length };
    } catch (error) {
      console.error('Error importing activities:', error);
      throw error;
    }
  };

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
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onActivityLogToggle={() => setActivityLogOpen(!activityLogOpen)}
      />
      
      <div className="flex-1 lg:ml-0">
        <Header 
          dashboardName={dashboard?.name || "Dashboard Principal"}
          onMenuClick={() => setSidebarOpen(true)}
          onShareClick={() => setShareModalOpen(true)}
          onExportClick={() => setExportModalOpen(true)}
          rightContent={
            <div className="flex items-center gap-2">
              <NotificationPreferencesDialog userId={userId} />
              <NotificationPopup userId={userId} />
            </div>
          }
        />
        
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {dashboard?.name || "Dashboard Principal"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Visão geral dos projetos e atividades
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <NewProjectModal
                trigger={
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Novo Projeto
                  </Button>
                }
                dashboardId={dashboardId}
                isOpen={newProjectModalOpen}
                onOpenChange={setNewProjectModalOpen}
              />
              <NewUserModal
                trigger={
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Novo Usuário
                  </Button>
                }
                isOpen={newUserModalOpen}
                onOpenChange={setNewUserModalOpen}
              />
              <ProjectsListModal
                trigger={
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Ver Projetos
                  </Button>
                }
                dashboardId={dashboardId}
                isOpen={projectsListModalOpen}
                onOpenChange={setProjectsListModalOpen}
                onNewProject={() => {
                  setProjectsListModalOpen(false);
                  setNewProjectModalOpen(true);
                }}
              />
              <UsersListModal
                trigger={
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Ver Usuários
                  </Button>
                }
                isOpen={usersListModalOpen}
                onOpenChange={setUsersListModalOpen}
                onNewUser={() => {
                  setUsersListModalOpen(false);
                  setNewUserModalOpen(true);
                }}
              />
              <Button
                onClick={() => setModalType('reports')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Relatórios
              </Button>
              <BackupSimple
                dashboardId={dashboardId}
                userId={userId}
                trigger={
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Backup
                  </Button>
                }
              />
              <Button
                onClick={() => {
                  // Create a test notification
                  createNotification({
                    userId,
                    dashboardId,
                    type: "system",
                    title: "Notificação de Teste",
                    message: "Esta é uma notificação de teste para demonstrar o sistema em tempo real.",
                    data: { test: true }
                  });
                }}
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Testar Notificação
              </Button>
              <DateAuditViewer
                dashboardId={dashboardId}
                trigger={
                  <Button variant="outline" className="gap-2">
                    <Archive className="h-4 w-4" />
                    Auditoria de Datas
                  </Button>
                }
              />
            </div>
          </div>

          <KPICards 
            metrics={metrics} 
            dashboardId={dashboardId}
            activities={activities}
            projects={projects}
            onKPIUpdate={() => setRefreshTrigger(Date.now())}
          />
          
          <ChartsSection 
            metrics={metrics}
            customCharts={customCharts}
            dashboardId={dashboardId}
            activities={activities}
            projects={projects}
            onChartsUpdate={() => setRefreshTrigger(Date.now())}
          />
          
          <ActivityTable 
            activities={metrics.filteredActivities}
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
            onActivitiesImport={handleBulkImport}
            onCustomColumnsUpdate={() => window.location.reload()}
            onExport={handleExport}
            dashboardId={dashboardId}
            onNewActivity={() => setNewActivityModalOpen(true)}
            onManageDependencies={() => setDependencyModalOpen(true)}
          />
          
          <ProjectViews 
            activities={activities}
            onUpdateActivity={updateActivity}
          />
          
          <BackupManagement 
            dashboardId={dashboardId}
            userId={1}
          />
          

        </main>
      </div>

      <ShareModalEnhanced 
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onShare={shareDashboard}
        dashboardId={dashboardId}
      />

      <ExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        availableColumns={availableColumns}
      />

      <ActivityLogPanel 
        isOpen={activityLogOpen}
        onClose={() => setActivityLogOpen(false)}
        logs={activityLogs}
      />
      
      <NewActivityModal
        isOpen={newActivityModalOpen}
        onClose={() => setNewActivityModalOpen(false)}
        onSubmit={(activityData) => {
          createActivity(activityData);
          handleActivityUpdate(activityData, 'create');
        }}
        projects={projects}
        activities={activities}
      />
      
      <DependencyModal
        isOpen={dependencyModalOpen}
        onClose={() => setDependencyModalOpen(false)}
        activities={activities}
        dashboardId={dashboardId}
      />
      
      <SimpleModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        type={modalType || 'projects'}
        projects={projects}
        activities={activities}
        users={[]} // Will be loaded from API
        dashboardId={dashboardId}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useActivityMetrics } from "@/hooks/use-activity-metrics";
import { useNotifications, useWebSocketNotifications } from "@/hooks/use-notifications";
import { useConsolidatedDashboard } from "@/hooks/use-consolidated-dashboard";
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
import { Plus, FolderOpen, Users, FileText, Upload, Archive, Crown } from "lucide-react";
import { BackupSimple } from "@/components/dashboard/backup-simple";
import { DependencyManager } from "@/components/dashboard/dependency-manager";
import { ActivityDateEditor } from "@/components/dashboard/activity-date-editor";
import { DateAuditViewer } from "@/components/dashboard/date-audit-viewer";
import { NewUserModal } from "@/components/dashboard/new-user-modal";
import { NewProjectModal } from "@/components/dashboard/new-project-modal";
import { UsersListModal } from "@/components/dashboard/users-list-modal";
import { ProjectsListModal } from "@/components/dashboard/projects-list-modal";
import ProjectsModal from "@/components/dashboard/projects-modal";
import UsersModal from "@/components/dashboard/users-modal";
import SuperUserModal from "@/components/dashboard/super-user-modal";

export default function Dashboard() {
  const { id } = useParams<{ id?: string }>();
  const dashboardId = id ? parseInt(id) : 1; // Default to dashboard 1
  const userId = 5; // Luis Ribeiro user ID
  const isConsolidatedDashboard = dashboardId === 1; // Dashboard 1 is consolidated read-only
  
  // Get user data to check if super user
  const [user, setUser] = useState<any>(null);
  const [isSuperUser, setIsSuperUser] = useState(false);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsSuperUser(userData.isSuperUser || false);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [userId]);
  
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
  const [superUserModalOpen, setSuperUserModalOpen] = useState(false);
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

  // Check access to consolidated dashboard
  if (isConsolidatedDashboard && !isSuperUser && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-lg border border-white/50">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
      </div>
    );
  }

  // Use consolidated dashboard for dashboard ID 1, regular dashboard for others
  const regularDashboard = useDashboardData(dashboardId);
  const consolidatedDashboard = useConsolidatedDashboard(userId);
  
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
    activities: consolidatedDashboard.consolidatedData.activities,
    projects: consolidatedDashboard.consolidatedData.projects,
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

  // Project management functions
  const createProject = async (projectData: any) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectData,
          dashboardId,
          startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
          endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : null
        })
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Error creating project:', error);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const updateProject = async (projectId: number, projectData: any) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectData,
          startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
          endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : null
        })
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Error updating project:', error);
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const deleteProject = async (projectId: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Error deleting project:', error);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  // User management functions
  const createUser = async (userData: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Error creating user:', error);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const updateUser = async (userId: number, userData: any) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Error updating user:', error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Error deleting user:', error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dashboard-container">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center dashboard-container">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro ao carregar dashboard</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex dashboard-container">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onActivityLogToggle={() => setActivityLogOpen(!activityLogOpen)}
        onUsersClick={() => setUsersListModalOpen(true)}
        onProjectsClick={() => setProjectsListModalOpen(true)}
        onReportsClick={() => setModalType('reports')}
        onSettingsClick={() => setModalType('import')}
        onScheduleClick={() => setModalType('schedule')}
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
              {isSuperUser && (
                <Button
                  onClick={() => setSuperUserModalOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2 text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                >
                  <Crown className="h-4 w-4" />
                  Super Usuários
                </Button>
              )}
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
            isReadOnly={isConsolidatedDashboard}
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
      
      <ProjectsModal
        isOpen={projectsListModalOpen}
        onClose={() => setProjectsListModalOpen(false)}
        projects={projects}
        activities={activities}
        onCreateProject={createProject}
        onUpdateProject={updateProject}
        onDeleteProject={deleteProject}
      />

      <UsersModal
        isOpen={usersListModalOpen}
        onClose={() => setUsersListModalOpen(false)}
        users={[]} // Will be loaded from API
        onCreateUser={createUser}
        onUpdateUser={updateUser}
        onDeleteUser={deleteUser}
      />

      <SuperUserModal
        isOpen={superUserModalOpen}
        onClose={() => setSuperUserModalOpen(false)}
        currentUserId={userId}
      />
    </div>
  );
}

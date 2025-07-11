import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useActivityMetrics } from "@/hooks/use-activity-metrics";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import KPICards from "@/components/dashboard/kpi-cards";
import ChartsSection from "@/components/dashboard/charts-section";
import ActivityTable from "@/components/dashboard/activity-table";
import ShareModal from "@/components/dashboard/share-modal";
import ActivityLogPanel from "@/components/dashboard/activity-log-panel";
import ExportModal from "@/components/dashboard/export-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { id } = useParams<{ id?: string }>();
  const dashboardId = id ? parseInt(id) : 1; // Default to dashboard 1
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterResponsible, setFilterResponsible] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
            <Button 
              onClick={() => {
                // TODO: Open create activity modal
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Atividade
            </Button>
          </div>

          <KPICards metrics={metrics} />
          
          <ChartsSection 
            metrics={metrics}
            customCharts={customCharts}
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
          />
        </main>
      </div>

      <ShareModal 
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onShare={shareDashboard}
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
    </div>
  );
}

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Settings, Network, Filter, Search, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import HierarchicalActivities from './hierarchical-activities';
import SimpleActivityTable from './simple-activity-table';
import HierarchicalTaskTable from './hierarchical-task-table';
import DependencyManager from './dependency-manager';
import TableSettingsModal from './table-settings-modal';
import { Activity } from '@/../shared/schema';

interface ActivitiesPanelProps {
  activities: Activity[];
  dashboardId: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNewActivity: () => void;
  onUpdateActivity: (id: number, activity: Partial<Activity>) => void;
  onDeleteActivity: (id: number) => void;
  onEditActivity: (activity: Activity) => void;
  onCreateSubActivity: (parentId: number) => void;
  onBulkImport: (activities: any[]) => void;
  customColumns?: any[];
}

const ActivitiesPanel: React.FC<ActivitiesPanelProps> = ({
  activities,
  dashboardId,
  searchTerm,
  onSearchChange,
  onNewActivity,
  onUpdateActivity,
  onDeleteActivity,
  onEditActivity,
  onCreateSubActivity,
  onBulkImport,
  customColumns = []
}) => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'hierarchical' | 'table'>('hierarchical');
  const [showDependencies, setShowDependencies] = useState(false);
  const [showTableSettings, setShowTableSettings] = useState(false);

  const filteredActivities = (activities || []).filter(activity => {
    const searchText = (searchTerm || '').toLowerCase();
    return (
      activity?.name?.toLowerCase().includes(searchText) ||
      activity?.description?.toLowerCase().includes(searchText) ||
      activity?.discipline?.toLowerCase().includes(searchText) ||
      activity?.responsible?.toLowerCase().includes(searchText)
    );
  });

  const getStatusCounts = () => {
    const counts = {
      total: (activities || []).length,
      completed: 0,
      in_progress: 0,
      not_started: 0,
      delayed: 0
    };

    (activities || []).forEach(activity => {
      switch (activity?.status) {
        case 'completed':
          counts.completed++;
          break;
        case 'in_progress':
          counts.in_progress++;
          break;
        case 'not_started':
          counts.not_started++;
          break;
        case 'delayed':
          counts.delayed++;
          break;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Atividades</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie suas atividades e subatividades
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Status Summary */}
            <div className="flex items-center gap-2 mr-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Total: {statusCounts.total}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Concluídas: {statusCounts.completed}
              </Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                Em Andamento: {statusCounts.in_progress}
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                Atrasadas: {statusCounts.delayed}
              </Badge>
            </div>

            {/* Action Buttons */}
            <Button
              onClick={onNewActivity}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Atividade
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Action Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar atividades..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <DependencyManager
              dashboardId={dashboardId}
              activities={activities}
              trigger={
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Dependências
                </Button>
              }
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode(viewMode === 'hierarchical' ? 'table' : 'hierarchical')}>
                  {viewMode === 'hierarchical' ? 'Visualização em Tabela' : 'Visualização Hierárquica'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowTableSettings(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações da Tabela
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onBulkImport([])}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Atividades
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // Export functionality
                  const csvData = activities.map(activity => ({
                    Nome: activity.name,
                    Descrição: activity.description,
                    Responsável: activity.responsible,
                    Status: activity.status,
                    Progresso: activity.completionPercentage
                  }));
                  const csvContent = "data:text/csv;charset=utf-8," + 
                    Object.keys(csvData[0] || {}).join(",") + "\n" +
                    csvData.map(row => Object.values(row).join(",")).join("\n");
                  
                  const link = document.createElement("a");
                  link.setAttribute("href", encodeURI(csvContent));
                  link.setAttribute("download", "atividades.csv");
                  link.click();
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros Avançados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Enhanced Hierarchical View */}
        <HierarchicalTaskTable
          activities={filteredActivities}
          onUpdateActivity={onUpdateActivity}
          onDeleteActivity={onDeleteActivity}
          onCreateSubActivity={() => {
            // Invalidar apenas as queries relacionadas a atividades
            queryClient.invalidateQueries({ queryKey: ['/api/activities/dashboard', dashboardId] });
          }}
          onEditActivity={onEditActivity}
          showDependencies={showDependencies}
          onManageDependencies={(activityId) => {
            // Handle dependency management for specific activity
            console.log('Managing dependencies for activity:', activityId);
          }}
        />
      </CardContent>

      {/* Modal de Configurações da Tabela */}
      <TableSettingsModal
        open={showTableSettings}
        onClose={() => setShowTableSettings(false)}
        dashboardId={dashboardId}
      />
    </Card>
  );
};

export default ActivitiesPanel;
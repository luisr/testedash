import React, { useState } from 'react';
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
import ActivityTable from './activity-table';
import DependencyManager from './dependency-manager';
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
  const [viewMode, setViewMode] = useState<'hierarchical' | 'table'>('hierarchical');
  const [showDependencies, setShowDependencies] = useState(false);

  const filteredActivities = (activities || []).filter(activity =>
    activity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity?.discipline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity?.responsible?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

            {/* Configuration Buttons */}
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
            
            <Button
              onClick={onNewActivity}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Atividade
            </Button>
            
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
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Atividades
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Atividades
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
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar atividades..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View Tabs */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'hierarchical' | 'table')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hierarchical">Visualização Hierárquica</TabsTrigger>
            <TabsTrigger value="table">Visualização em Tabela</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hierarchical" className="space-y-4">
            <HierarchicalActivities
              activities={filteredActivities}
              onUpdateActivity={onUpdateActivity}
              onDeleteActivity={onDeleteActivity}
              onCreateSubActivity={onCreateSubActivity}
              onEditActivity={onEditActivity}
            />
          </TabsContent>
          
          <TabsContent value="table" className="space-y-4">
            <ActivityTable
              activities={filteredActivities}
              customColumns={customColumns}
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActivitiesPanel;
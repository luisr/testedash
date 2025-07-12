import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Calendar,
  User,
  Filter,
  Search,
  Edit2,
  Trash2,
  GitBranch
} from 'lucide-react';
import { Activity } from '@shared/schema';
import CreateSubActivityModal from './create-sub-activity-modal';

interface HierarchicalTaskTableProps {
  activities: Activity[];
  onUpdateActivity: (id: number, data: Partial<Activity>) => void;
  onDeleteActivity: (id: number) => void;
  onCreateSubActivity: (parentId: number) => void;
  onEditActivity: (activity: Activity) => void;
  showDependencies?: boolean;
  onManageDependencies?: (activityId: number) => void;
  visibleFields?: string[];
}

interface ActivityNode extends Activity {
  children: ActivityNode[];
  level: number;
  isExpanded: boolean;
}

const statusConfig = {
  not_started: { label: 'Não Iniciado', color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50' },
  in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800', bgColor: 'bg-blue-50' },
  completed: { label: 'Concluído', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50' },
  delayed: { label: 'Atrasado', color: 'bg-red-100 text-red-800', bgColor: 'bg-red-50' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50' }
};

const priorityConfig = {
  low: { label: 'Baixa', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Crítica', color: 'bg-red-100 text-red-800' }
};

export default function HierarchicalTaskTable({
  activities,
  onUpdateActivity,
  onDeleteActivity,
  onCreateSubActivity,
  onEditActivity,
  showDependencies = false,
  onManageDependencies,
  visibleFields = []
}: HierarchicalTaskTableProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  // Função para verificar se um campo deve ser visível
  const isFieldVisible = (fieldKey: string) => {
    if (!visibleFields || visibleFields.length === 0) return true; // Se não há configuração, mostra todos
    return visibleFields.includes(fieldKey);
  };

  // Build hierarchical tree structure
  const buildHierarchy = (activities: Activity[]): ActivityNode[] => {
    const activityMap = new Map<number, ActivityNode>();
    const rootNodes: ActivityNode[] = [];

    // First pass: create all nodes
    activities.forEach(activity => {
      activityMap.set(activity.id, {
        ...activity,
        children: [],
        level: 0,
        isExpanded: expandedNodes.has(activity.id)
      });
    });

    // Second pass: build hierarchy
    activities.forEach(activity => {
      const node = activityMap.get(activity.id)!;
      
      if (activity.parentActivityId && activityMap.has(activity.parentActivityId)) {
        const parent = activityMap.get(activity.parentActivityId)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  // Flatten hierarchy for display
  const flattenHierarchy = (nodes: ActivityNode[]): ActivityNode[] => {
    const result: ActivityNode[] = [];
    
    const traverse = (node: ActivityNode) => {
      result.push(node);
      
      if (node.isExpanded && node.children.length > 0) {
        node.children
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach(traverse);
      }
    };

    nodes.forEach(traverse);
    return result;
  };

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = !searchTerm || 
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.responsible?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || activity.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [activities, searchTerm, filterStatus, filterPriority]);

  const hierarchicalData = useMemo(() => {
    const hierarchy = buildHierarchy(filteredActivities);
    return flattenHierarchy(hierarchy);
  }, [filteredActivities, expandedNodes]);

  const toggleExpanded = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Não definido';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started;
    return (
      <Badge className={`${config.color} text-xs font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return (
      <Badge variant="outline" className={`${config.color} text-xs font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Estrutura Hierárquica de Tarefas
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedNodes(new Set(activities.map(a => a.id)))}
            >
              Expandir Todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedNodes(new Set())}
            >
              Recolher Todas
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">Todos os Status</option>
            <option value="not_started">Não Iniciado</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluído</option>
            <option value="delayed">Atrasado</option>
          </select>

          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>

        {/* Hierarchical Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-8"></TableHead>
                {isFieldVisible('name') && <TableHead className="font-semibold">Tarefa</TableHead>}
                {isFieldVisible('responsible') && <TableHead className="font-semibold">Responsável</TableHead>}
                {isFieldVisible('status') && <TableHead className="font-semibold">Status</TableHead>}
                {isFieldVisible('priority') && <TableHead className="font-semibold">Prioridade</TableHead>}
                {isFieldVisible('completionPercentage') && <TableHead className="font-semibold">Progresso</TableHead>}
                {isFieldVisible('plannedStartDate') && <TableHead className="font-semibold">Datas</TableHead>}
                {isFieldVisible('actions') && <TableHead className="font-semibold">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {hierarchicalData.map((activity) => (
                <TableRow 
                  key={activity.id} 
                  className={`hover:bg-muted/50 transition-colors ${
                    statusConfig[activity.status as keyof typeof statusConfig]?.bgColor || ''
                  }`}
                >
                  <TableCell>
                    <div className="flex items-center" style={{ marginLeft: `${activity.level * 20}px` }}>
                      {activity.children.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0"
                          onClick={() => toggleExpanded(activity.id)}
                        >
                          {activity.isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      ) : (
                        <div className="w-6 h-6"></div>
                      )}
                    </div>
                  </TableCell>
                  
                  {isFieldVisible('name') && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-foreground">
                            {activity.name}
                            {activity.level > 0 && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Subtarefa
                              </Badge>
                            )}
                          </div>
                          {activity.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {activity.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {isFieldVisible('responsible') && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {activity.responsible || 'Não atribuído'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {activity.discipline || 'Geral'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {isFieldVisible('status') && (
                    <TableCell>
                      {getStatusBadge(activity.status)}
                    </TableCell>
                  )}

                  {isFieldVisible('priority') && (
                    <TableCell>
                      {getPriorityBadge(activity.priority)}
                    </TableCell>
                  )}

                  {isFieldVisible('completionPercentage') && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Progress 
                            value={parseFloat(activity.completionPercentage || "0")} 
                            className="h-2"
                          />
                        </div>
                        <span className="text-sm font-medium min-w-[3rem]">
                          {activity.completionPercentage || 0}%
                        </span>
                      </div>
                    </TableCell>
                  )}

                  {isFieldVisible('plannedStartDate') && (
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {formatDate(activity.startDate)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          até {formatDate(activity.finishDate)}
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {isFieldVisible('actions') && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            console.log('Hierarchical table edit button clicked for activity:', activity.id);
                            onEditActivity(activity);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        
                        <CreateSubActivityModal
                          parentActivity={activity}
                          onSuccess={() => {
                            // Refresh the activities by calling the onCreateSubActivity callback
                            onCreateSubActivity(activity.id);
                          }}
                        />

                        {showDependencies && onManageDependencies && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onManageDependencies(activity.id)}
                          >
                            <GitBranch className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => {
                            console.log('Hierarchical table delete button clicked for activity:', activity.id);
                            if (confirm('Tem certeza que deseja excluir esta atividade?')) {
                              console.log('Confirmed deletion of activity:', activity.id);
                              onDeleteActivity(activity.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {hierarchicalData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma tarefa encontrada</p>
            <p className="text-sm">Ajuste os filtros ou adicione novas tarefas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Activity } from '@shared/schema';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  User, 
  Clock,
  Star,
  ArrowRight,
  List,
  Target,
  Zap,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface BacklogViewProps {
  activities: Activity[];
  projects: any[];
  onUpdateActivity: (id: number, data: Partial<Activity>) => void;
}

const priorityColors = {
  'low': 'bg-green-100 text-green-800 border-green-300',
  'medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'high': 'bg-orange-100 text-orange-800 border-orange-300',
  'critical': 'bg-red-100 text-red-800 border-red-300'
};

const priorityLabels = {
  'low': 'Baixa',
  'medium': 'Média',
  'high': 'Alta',
  'critical': 'Crítica'
};

const priorityIcons = {
  'low': <div className="w-2 h-2 bg-green-500 rounded-full" />,
  'medium': <div className="w-2 h-2 bg-yellow-500 rounded-full" />,
  'high': <div className="w-2 h-2 bg-orange-500 rounded-full" />,
  'critical': <AlertCircle className="w-4 h-4 text-red-500" />
};

export default function BacklogView({ activities, projects, onUpdateActivity }: BacklogViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'all' | 'ready' | 'blocked'>('all');

  // Backlog items: not started, in progress with low completion, or future planned activities
  const backlogItems = useMemo(() => {
    return activities
      .filter(activity => {
        // Include activities that are not started, barely started, or planned for future
        const isNotStarted = activity.status === 'not_started';
        const isLowProgress = activity.status === 'in_progress' && (activity.completionPercentage || 0) < 25;
        const isFuturePlanned = activity.plannedStartDate && new Date(activity.plannedStartDate) > new Date();
        
        return isNotStarted || isLowProgress || isFuturePlanned;
      })
      .filter(activity => {
        const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             activity.responsible?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesPriority = !filterPriority || activity.priority === filterPriority;
        const matchesDiscipline = !filterDiscipline || activity.discipline === filterDiscipline;
        
        return matchesSearch && matchesPriority && matchesDiscipline;
      })
      .sort((a, b) => {
        // Sort by priority (critical first), then by planned start date
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        const aDate = a.plannedStartDate ? new Date(a.plannedStartDate).getTime() : 0;
        const bDate = b.plannedStartDate ? new Date(b.plannedStartDate).getTime() : 0;
        return aDate - bDate;
      });
  }, [activities, searchTerm, filterPriority, filterDiscipline]);

  const filteredBacklogItems = useMemo(() => {
    if (viewMode === 'ready') {
      return backlogItems.filter(item => 
        item.responsible && 
        item.plannedStartDate && 
        item.status === 'not_started'
      );
    }
    if (viewMode === 'blocked') {
      return backlogItems.filter(item => 
        !item.responsible || 
        !item.plannedStartDate ||
        item.status === 'delayed'
      );
    }
    return backlogItems;
  }, [backlogItems, viewMode]);

  const disciplines = useMemo(() => {
    const uniqueDisciplines = [...new Set(activities.map(a => a.discipline).filter(Boolean))];
    return uniqueDisciplines;
  }, [activities]);

  const handleActivityToggle = (activityId: number) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activityId)) {
      newSelected.delete(activityId);
    } else {
      newSelected.add(activityId);
    }
    setSelectedActivities(newSelected);
  };

  const getItemStatus = (activity: Activity) => {
    if (!activity.responsible) return { type: 'blocked', reason: 'Sem responsável' };
    if (!activity.plannedStartDate) return { type: 'blocked', reason: 'Sem data planejada' };
    if (activity.status === 'delayed') return { type: 'blocked', reason: 'Atrasado' };
    if (activity.status === 'not_started') return { type: 'ready', reason: 'Pronto para iniciar' };
    return { type: 'progress', reason: 'Em andamento' };
  };

  const getStatusColor = (status: { type: string; reason: string }) => {
    switch (status.type) {
      case 'ready': return 'bg-green-50 border-green-200 text-green-800';
      case 'blocked': return 'bg-red-50 border-red-200 text-red-800';
      case 'progress': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const summaryStats = useMemo(() => {
    const ready = filteredBacklogItems.filter(item => getItemStatus(item).type === 'ready').length;
    const blocked = filteredBacklogItems.filter(item => getItemStatus(item).type === 'blocked').length;
    const progress = filteredBacklogItems.filter(item => getItemStatus(item).type === 'progress').length;
    const milestones = filteredBacklogItems.filter(item => item.isMilestone).length;
    
    return { ready, blocked, progress, milestones, total: filteredBacklogItems.length };
  }, [filteredBacklogItems]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Backlog do Projeto</h2>
          <p className="text-muted-foreground">Atividades planejadas e não iniciadas</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            {summaryStats.total} itens
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pronto para Iniciar</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.ready}</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bloqueado</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.blocked}</p>
              </div>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{summaryStats.progress}</p>
              </div>
              <Zap className="w-4 h-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Marcos</p>
                <p className="text-2xl font-bold text-yellow-600">{summaryStats.milestones}</p>
              </div>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Visualização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar no backlog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Todas as Prioridades</option>
              {Object.entries(priorityLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select 
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Todas as Disciplinas</option>
              {disciplines.map(discipline => (
                <option key={discipline} value={discipline}>{discipline}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('all')}
              >
                Todos
              </Button>
              <Button 
                variant={viewMode === 'ready' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('ready')}
              >
                Prontos
              </Button>
              <Button 
                variant={viewMode === 'blocked' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('blocked')}
              >
                Bloqueados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backlog Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Itens do Backlog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredBacklogItems.map((item) => {
              const status = getItemStatus(item);
              return (
                <div 
                  key={item.id} 
                  className={`p-4 border rounded-lg ${getStatusColor(status)} transition-all hover:shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={selectedActivities.has(item.id)}
                        onCheckedChange={() => handleActivityToggle(item.id)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {item.isMilestone && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                          <h4 className="font-semibold text-foreground">{item.name}</h4>
                          <Badge className={priorityColors[item.priority as keyof typeof priorityColors]}>
                            {priorityLabels[item.priority as keyof typeof priorityLabels]}
                          </Badge>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{item.responsible || 'Não atribuído'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {item.plannedStartDate ? formatDate(item.plannedStartDate) : 'Não planejado'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{item.discipline || 'Geral'}</span>
                          </div>
                        </div>
                        
                        {(item.plannedCost || item.actualCost) && (
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Custo Planejado: </span>
                              <span className="font-medium">{formatCurrency(item.plannedCost || 0)}</span>
                            </div>
                            {item.actualCost && (
                              <div>
                                <span className="text-muted-foreground">Custo Real: </span>
                                <span className="font-medium">{formatCurrency(item.actualCost || 0)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {priorityIcons[item.priority as keyof typeof priorityIcons]}
                      <Badge variant="outline" className="text-xs">
                        {status.reason}
                      </Badge>
                      {item.status === 'in_progress' && (
                        <Badge variant="secondary" className="text-xs">
                          {item.completionPercentage || 0}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {filteredBacklogItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <List className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Backlog vazio</h3>
            <p className="text-muted-foreground">
              {viewMode === 'all' 
                ? 'Não há itens no backlog com os filtros aplicados.' 
                : `Não há itens ${viewMode === 'ready' ? 'prontos' : 'bloqueados'} no momento.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
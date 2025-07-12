import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity } from '@shared/schema';
import { 
  Calendar, 
  MapPin, 
  Star, 
  TrendingUp, 
  Clock,
  Users,
  Target,
  ArrowRight
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface RoadmapViewProps {
  activities: Activity[];
  projects: any[];
}

interface TimelineItem {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  status: string;
  priority: string;
  isMilestone: boolean;
  responsible: string;
  completionPercentage: number;
  plannedCost: number;
  actualCost: number;
  discipline: string;
}

const statusColors = {
  'not_started': 'bg-gray-100 text-gray-800 border-gray-300',
  'in_progress': 'bg-blue-100 text-blue-800 border-blue-300',
  'completed': 'bg-green-100 text-green-800 border-green-300',
  'delayed': 'bg-orange-100 text-orange-800 border-orange-300',
  'cancelled': 'bg-red-100 text-red-800 border-red-300'
};

const priorityColors = {
  'low': 'bg-green-50 border-green-200',
  'medium': 'bg-yellow-50 border-yellow-200',
  'high': 'bg-orange-50 border-orange-200',
  'critical': 'bg-red-50 border-red-200'
};

export default function RoadmapView({ activities, projects }: RoadmapViewProps) {
  const [selectedQuarter, setSelectedQuarter] = useState('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [showOnlyMilestones, setShowOnlyMilestones] = useState(false);

  const timelineItems = useMemo(() => {
    return activities
      .filter(activity => {
        if (showOnlyMilestones && !activity.isMilestone) return false;
        if (selectedDiscipline !== 'all' && activity.discipline !== selectedDiscipline) return false;
        return activity.plannedStartDate && activity.plannedFinishDate;
      })
      .map(activity => ({
        id: activity.id,
        name: activity.name,
        startDate: new Date(activity.plannedStartDate!),
        endDate: new Date(activity.plannedFinishDate!),
        status: activity.status,
        priority: activity.priority,
        isMilestone: activity.isMilestone || false,
        responsible: activity.responsible || 'Não definido',
        completionPercentage: activity.completionPercentage || 0,
        plannedCost: parseFloat(activity.plannedCost || '0'),
        actualCost: parseFloat(activity.actualCost || '0'),
        discipline: activity.discipline || 'Geral'
      }))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [activities, selectedQuarter, selectedDiscipline, showOnlyMilestones]);

  const quarters = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      { value: 'all', label: 'Todos os Períodos' },
      { value: `${currentYear}-Q1`, label: `Q1 ${currentYear}` },
      { value: `${currentYear}-Q2`, label: `Q2 ${currentYear}` },
      { value: `${currentYear}-Q3`, label: `Q3 ${currentYear}` },
      { value: `${currentYear}-Q4`, label: `Q4 ${currentYear}` }
    ];
  }, []);

  const disciplines = useMemo(() => {
    const uniqueDisciplines = [...new Set(activities.map(a => a.discipline).filter(Boolean))];
    return [
      { value: 'all', label: 'Todas as Disciplinas' },
      ...uniqueDisciplines.map(d => ({ value: d, label: d }))
    ];
  }, [activities]);

  const milestones = useMemo(() => {
    return timelineItems.filter(item => item.isMilestone);
  }, [timelineItems]);

  const getQuarterFromDate = (date: Date) => {
    const month = date.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    return `Q${quarter} ${date.getFullYear()}`;
  };

  const getProgressBarColor = (status: string, percentage: number) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'delayed') return 'bg-orange-500';
    if (status === 'cancelled') return 'bg-red-500';
    if (percentage > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Roadmap do Projeto</h2>
          <p className="text-muted-foreground">Visualização cronológica das atividades e marcos</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            {timelineItems.length} atividades
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            {milestones.length} marcos
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Filtros da Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Período</label>
              <select 
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {quarters.map(quarter => (
                  <option key={quarter.value} value={quarter.value}>{quarter.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Disciplina</label>
              <select 
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {disciplines.map(discipline => (
                  <option key={discipline.value} value={discipline.value}>{discipline.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                variant={showOnlyMilestones ? "default" : "outline"}
                onClick={() => setShowOnlyMilestones(!showOnlyMilestones)}
                className="flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                {showOnlyMilestones ? 'Mostrar Tudo' : 'Só Marcos'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones Overview */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Marcos Principais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <h4 className="font-semibold text-foreground">{milestone.name}</h4>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {formatDate(milestone.startDate)} - {formatDate(milestone.endDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      {milestone.responsible}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Progresso</span>
                      <span>{milestone.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressBarColor(milestone.status, milestone.completionPercentage)}`}
                        style={{ width: `${milestone.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Timeline do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timelineItems.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Timeline connector */}
                {index < timelineItems.length - 1 && (
                  <div className="absolute left-8 top-16 w-px h-12 bg-border" />
                )}
                
                <div className="flex items-start gap-4">
                  {/* Timeline marker */}
                  <div className={`w-4 h-4 rounded-full mt-3 flex-shrink-0 border-2 ${
                    item.isMilestone 
                      ? 'bg-yellow-500 border-yellow-600' 
                      : item.status === 'completed' 
                        ? 'bg-green-500 border-green-600'
                        : item.status === 'in_progress'
                          ? 'bg-blue-500 border-blue-600'
                          : 'bg-gray-300 border-gray-400'
                  }`}>
                    {item.isMilestone && (
                      <Star className="w-2 h-2 text-white fill-white absolute top-0.5 left-0.5" />
                    )}
                  </div>
                  
                  {/* Timeline content */}
                  <div className={`flex-1 p-4 rounded-lg border ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          {item.isMilestone && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Marco
                            </Badge>
                          )}
                          <Badge className={statusColors[item.status as keyof typeof statusColors]}>
                            {item.status === 'not_started' && 'Não Iniciado'}
                            {item.status === 'in_progress' && 'Em Andamento'}
                            {item.status === 'completed' && 'Concluído'}
                            {item.status === 'delayed' && 'Atrasado'}
                            {item.status === 'cancelled' && 'Cancelado'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                              <Calendar className="w-3 h-3" />
                              Período
                            </div>
                            <div className="font-medium">
                              {formatDate(item.startDate)} 
                              <ArrowRight className="w-3 h-3 inline mx-1" />
                              {formatDate(item.endDate)}
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                              <Users className="w-3 h-3" />
                              Responsável
                            </div>
                            <div className="font-medium">{item.responsible}</div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                              <Target className="w-3 h-3" />
                              Disciplina
                            </div>
                            <div className="font-medium">{item.discipline}</div>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium">{item.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(item.status, item.completionPercentage)}`}
                              style={{ width: `${item.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Budget info */}
                        {(item.plannedCost > 0 || item.actualCost > 0) && (
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Planejado: </span>
                              <span className="font-medium">{formatCurrency(item.plannedCost)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Real: </span>
                              <span className="font-medium">{formatCurrency(item.actualCost)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {timelineItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma atividade na timeline</h3>
            <p className="text-muted-foreground">Adicione datas às atividades para visualizar o roadmap.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
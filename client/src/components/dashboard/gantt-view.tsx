import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity } from '@/../shared/schema';
import { 
  Calendar,
  Clock,
  User,
  Target,
  TrendingUp,
  Settings
} from 'lucide-react';

interface GanttViewProps {
  activities: Activity[];
  onUpdateActivity: (id: number, data: Partial<Activity>) => void;
}

interface GanttBar {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  baselineStartDate?: Date;
  baselineEndDate?: Date;
  progress: number;
  status: string;
  priority: string;
  responsible: string;
  isBaseline?: boolean;
  parentId?: number;
}

export default function GanttView({ activities, onUpdateActivity }: GanttViewProps) {
  const [showBaseline, setShowBaseline] = useState(true);
  const [timelineStart, setTimelineStart] = useState<Date>(new Date());
  const [timelineEnd, setTimelineEnd] = useState<Date>(new Date());
  const [ganttBars, setGanttBars] = useState<GanttBar[]>([]);

  useEffect(() => {
    const bars: GanttBar[] = [];
    let minDate = new Date();
    let maxDate = new Date();
    
    (activities || []).forEach(activity => {
      const startDate = activity?.plannedStartDate ? new Date(activity.plannedStartDate) : new Date();
      const endDate = activity?.plannedEndDate ? new Date(activity.plannedEndDate) : new Date();
      const baselineStart = activity?.baselineStartDate ? new Date(activity.baselineStartDate) : undefined;
      const baselineEnd = activity?.baselineEndDate ? new Date(activity.baselineEndDate) : undefined;
      
      if (startDate < minDate) minDate = startDate;
      if (endDate > maxDate) maxDate = endDate;
      
      bars.push({
        id: activity.id,
        name: activity.name,
        startDate,
        endDate,
        baselineStartDate: baselineStart,
        baselineEndDate: baselineEnd,
        progress: parseFloat(activity.completionPercentage || '0'),
        status: activity.status,
        priority: activity.priority,
        responsible: activity.responsible,
        parentId: activity.parentActivityId || undefined
      });
    });
    
    setGanttBars(bars);
    setTimelineStart(new Date(minDate.getTime() - 7 * 24 * 60 * 60 * 1000)); // 1 week before
    setTimelineEnd(new Date(maxDate.getTime() + 7 * 24 * 60 * 60 * 1000)); // 1 week after
  }, [activities]);

  const generateTimelineHeaders = () => {
    const headers = [];
    const current = new Date(timelineStart);
    
    while (current <= timelineEnd) {
      headers.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return headers;
  };

  const calculateBarPosition = (startDate: Date, endDate: Date) => {
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const startOffset = Math.ceil((startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'not_started': 'bg-gray-400',
      'in_progress': 'bg-blue-500',
      'completed': 'bg-green-500',
      'delayed': 'bg-orange-500',
      'cancelled': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'border-green-500',
      'medium': 'border-yellow-500',
      'high': 'border-orange-500',
      'critical': 'border-red-500'
    };
    return colors[priority as keyof typeof colors] || 'border-gray-400';
  };

  const handleSetBaseline = (activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      onUpdateActivity(activityId, {
        baselineStartDate: activity.plannedStartDate,
        baselineEndDate: activity.plannedEndDate
      });
    }
  };

  const timelineHeaders = generateTimelineHeaders();
  const monthGroups = timelineHeaders.reduce((acc, date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(date);
    return acc;
  }, {} as Record<string, Date[]>);

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Gráfico de Gantt
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={showBaseline ? "default" : "outline"}
                size="sm"
                onClick={() => setShowBaseline(!showBaseline)}
              >
                <Target className="w-4 h-4 mr-1" />
                Linha Base
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  ganttBars.forEach(bar => {
                    if (!bar.baselineStartDate) {
                      handleSetBaseline(bar.id);
                    }
                  });
                }}
              >
                <Settings className="w-4 h-4 mr-1" />
                Definir Linha Base
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Timeline Header */}
              <div className="grid grid-cols-[300px_1fr] gap-4 mb-4">
                <div className="font-medium text-sm">Atividades</div>
                <div className="space-y-1">
                  {/* Month headers */}
                  <div className="flex">
                    {Object.entries(monthGroups).map(([key, dates]) => {
                      const monthName = new Date(dates[0]).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                      return (
                        <div
                          key={key}
                          className="text-center text-sm font-medium border-r border-gray-200 px-2 py-1"
                          style={{ width: `${(dates.length / timelineHeaders.length) * 100}%` }}
                        >
                          {monthName}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Day headers */}
                  <div className="flex text-xs text-muted-foreground">
                    {timelineHeaders.map((date, index) => (
                      <div
                        key={index}
                        className="text-center border-r border-gray-100 px-1 py-1"
                        style={{ width: `${(1 / timelineHeaders.length) * 100}%` }}
                      >
                        {date.getDate()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gantt Chart Body */}
              <div className="space-y-2">
                {ganttBars.map(bar => (
                  <div key={bar.id} className="grid grid-cols-[300px_1fr] gap-4 items-center">
                    {/* Activity Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm truncate">
                          {bar.parentId && '└─ '}{bar.name}
                        </div>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(bar.priority)}`}>
                          {bar.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {bar.responsible}
                      </div>
                    </div>

                    {/* Gantt Bar */}
                    <div className="relative h-8">
                      {/* Baseline Bar */}
                      {showBaseline && bar.baselineStartDate && bar.baselineEndDate && (
                        <div
                          className="absolute top-0 h-2 bg-gray-300 rounded opacity-60"
                          style={calculateBarPosition(bar.baselineStartDate, bar.baselineEndDate)}
                          title="Linha Base"
                        />
                      )}
                      
                      {/* Main Bar */}
                      <div
                        className={`absolute top-2 h-4 ${getStatusColor(bar.status)} rounded relative overflow-hidden`}
                        style={calculateBarPosition(bar.startDate, bar.endDate)}
                      >
                        {/* Progress Bar */}
                        <div
                          className="absolute top-0 left-0 h-full bg-white bg-opacity-30 rounded"
                          style={{ width: `${bar.progress}%` }}
                        />
                        
                        {/* Progress Text */}
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                          {bar.progress > 0 ? `${bar.progress}%` : ''}
                        </div>
                      </div>
                      
                      {/* Dates */}
                      <div className="absolute top-6 left-0 text-xs text-muted-foreground">
                        {bar.startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </div>
                      <div className="absolute top-6 right-0 text-xs text-muted-foreground">
                        {bar.endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
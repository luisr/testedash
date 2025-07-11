import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity } from '@/../shared/schema';
import { 
  Clock, 
  User, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  XCircle
} from 'lucide-react';

interface KanbanViewProps {
  activities: Activity[];
  onUpdateActivity: (id: number, data: Partial<Activity>) => void;
}

const statusColumns = [
  { id: 'not_started', title: 'Não Iniciado', icon: PauseCircle, color: 'bg-gray-100 border-gray-300' },
  { id: 'in_progress', title: 'Em Andamento', icon: PlayCircle, color: 'bg-blue-100 border-blue-300' },
  { id: 'completed', title: 'Concluído', icon: CheckCircle, color: 'bg-green-100 border-green-300' },
  { id: 'delayed', title: 'Atrasado', icon: AlertCircle, color: 'bg-orange-100 border-orange-300' },
  { id: 'cancelled', title: 'Cancelado', icon: XCircle, color: 'bg-red-100 border-red-300' }
];

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica'
};

export default function KanbanView({ activities, onUpdateActivity }: KanbanViewProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const activityId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    onUpdateActivity(activityId, { status: newStatus });
    setDraggedItem(null);
  };

  const handleDragStart = (start: any) => {
    setDraggedItem(start.draggableId);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Não definido';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num || 0);
  };

  return (
    <div className="h-full overflow-hidden">
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <div className="flex gap-6 h-full overflow-x-auto p-4">
          {statusColumns.map(column => {
            const columnActivities = (activities || []).filter(activity => activity?.status === column.id);
            const IconComponent = column.icon;
            
            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                <Card className={`h-full ${column.color}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {column.title}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {columnActivities.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`space-y-3 min-h-[200px] transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
                          }`}
                        >
                          {columnActivities.map((activity, index) => (
                            <Draggable
                              key={activity.id}
                              draggableId={activity.id.toString()}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`cursor-move transition-all ${
                                    snapshot.isDragging ? 'shadow-lg rotate-2' : 'shadow-sm hover:shadow-md'
                                  } ${draggedItem === activity.id.toString() ? 'opacity-50' : ''}`}
                                >
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between">
                                        <h4 className="font-medium text-sm line-clamp-2">
                                          {activity.name}
                                        </h4>
                                        {activity.parentActivityId && (
                                          <Badge variant="outline" className="text-xs">
                                            Sub
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      {activity.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                          {activity.description}
                                        </p>
                                      )}
                                      
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs">
                                          <User className="w-3 h-3" />
                                          <span>{activity.responsible}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-xs">
                                          <Calendar className="w-3 h-3" />
                                          <span>{formatDate(activity.plannedEndDate)}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-xs">
                                          <DollarSign className="w-3 h-3" />
                                          <span>{formatCurrency(activity.plannedValue)}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center justify-between">
                                        <Badge 
                                          variant="secondary" 
                                          className={`text-xs ${priorityColors[activity.priority as keyof typeof priorityColors]}`}
                                        >
                                          {priorityLabels[activity.priority as keyof typeof priorityLabels]}
                                        </Badge>
                                        
                                        <div className="text-xs text-muted-foreground">
                                          {activity.discipline}
                                        </div>
                                      </div>
                                      
                                      {activity.completionPercentage && parseFloat(activity.completionPercentage) > 0 && (
                                        <div className="space-y-1">
                                          <div className="flex justify-between text-xs">
                                            <span>Progresso</span>
                                            <span>{activity.completionPercentage}%</span>
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                              className="bg-blue-500 h-2 rounded-full transition-all"
                                              style={{ width: `${activity.completionPercentage}%` }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
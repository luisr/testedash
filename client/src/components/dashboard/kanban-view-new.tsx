import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  XCircle,
  Circle
} from 'lucide-react';

interface KanbanViewProps {
  activities: Activity[];
  onUpdateActivity: (id: number, data: Partial<Activity>) => void;
  customStatuses?: any[];
}

// Default status columns
const defaultStatusColumns = [
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

export default function KanbanView({ activities, onUpdateActivity, customStatuses = [] }: KanbanViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  
  // Create all status columns (default + custom)
  const allStatusColumns = [
    ...defaultStatusColumns,
    ...customStatuses.map(status => ({
      id: status.key,
      title: status.name,
      icon: Circle, // Use a default icon for custom statuses
      color: `bg-${status.color || 'blue'}-100 border-${status.color || 'blue'}-300`
    }))
  ];

  const handleDragStart = (start: any) => {
    setDraggedItemId(start.draggableId);
  };

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    
    // Reset dragged item
    setDraggedItemId(null);
    
    // Check if dropped outside or in same position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const activityId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    
    console.log('Kanban: Updating activity', activityId, 'to status', newStatus);
    
    setIsLoading(true);
    
    try {
      await onUpdateActivity(activityId, { status: newStatus });
      console.log('Kanban: Activity status updated successfully');
    } catch (error) {
      console.error('Kanban: Error updating activity status:', error);
    } finally {
      setIsLoading(false);
    }
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

  const getCompletionPercentage = (activity: Activity) => {
    return parseFloat(activity.completionPercentage || '0');
  };

  return (
    <div className="kanban-container h-full overflow-hidden">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto p-4">
          {allStatusColumns.map(column => {
            const columnActivities = activities.filter(activity => activity.status === column.id);
            const IconComponent = column.icon;
            
            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                <Card className={`h-full ${column.color} kanban-column`}>
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
                  
                  <CardContent className="pt-0 h-full">
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`space-y-3 min-h-[200px] transition-colors kanban-drop-zone ${
                            snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg border-2 border-blue-200 border-dashed' : ''
                          }`}
                        >
                          {columnActivities.map((activity, index) => (
                            <Draggable
                              key={activity.id}
                              draggableId={activity.id.toString()}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`kanban-card ${snapshot.isDragging ? 'kanban-card-dragging' : ''}`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    // Force z-index when dragging
                                    zIndex: snapshot.isDragging ? 10000 : 1,
                                  }}
                                >
                                  <Card className={`cursor-move transition-all shadow-sm hover:shadow-md ${
                                    snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                                  } ${draggedItemId === activity.id.toString() ? 'opacity-75' : ''}`}>
                                    <CardContent className="p-4">
                                      <div className="space-y-3">
                                        {/* Activity Title */}
                                        <div className="flex items-start justify-between">
                                          <h4 className="font-medium text-sm line-clamp-2 flex-1">
                                            {activity.name}
                                          </h4>
                                          {activity.parentActivityId && (
                                            <Badge variant="outline" className="text-xs ml-2">
                                              Sub
                                            </Badge>
                                          )}
                                        </div>
                                        
                                        {/* Description */}
                                        {activity.description && (
                                          <p className="text-xs text-muted-foreground line-clamp-2">
                                            {activity.description}
                                          </p>
                                        )}
                                        
                                        {/* Activity Details */}
                                        <div className="space-y-2">
                                          {/* Responsible */}
                                          <div className="flex items-center gap-2 text-xs">
                                            <User className="w-3 h-3 text-muted-foreground" />
                                            <span className="truncate">{activity.responsible || 'Não atribuído'}</span>
                                          </div>
                                          
                                          {/* Planned End Date */}
                                          <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="w-3 h-3 text-muted-foreground" />
                                            <span>{formatDate(activity.plannedEndDate)}</span>
                                          </div>
                                          
                                          {/* Budget */}
                                          <div className="flex items-center gap-2 text-xs">
                                            <DollarSign className="w-3 h-3 text-muted-foreground" />
                                            <span>{formatCurrency(activity.plannedValue || 0)}</span>
                                          </div>
                                        </div>
                                        
                                        {/* Priority and Discipline */}
                                        <div className="flex items-center justify-between">
                                          <Badge 
                                            variant="secondary" 
                                            className={`text-xs ${priorityColors[activity.priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}`}
                                          >
                                            {priorityLabels[activity.priority as keyof typeof priorityLabels] || activity.priority}
                                          </Badge>
                                          
                                          <div className="text-xs text-muted-foreground truncate max-w-[100px]">
                                            {activity.discipline || 'Geral'}
                                          </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        {getCompletionPercentage(activity) > 0 && (
                                          <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                              <span>Progresso</span>
                                              <span>{getCompletionPercentage(activity)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                              <div 
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${getCompletionPercentage(activity)}%` }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
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
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>Atualizando...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
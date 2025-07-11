import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Delete, 
  Clock,
  User,
  Calendar,
  Target,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Activity } from '@/../shared/schema';

interface HierarchicalActivitiesProps {
  activities: Activity[];
  onUpdateActivity: (id: number, activity: Partial<Activity>) => void;
  onDeleteActivity: (id: number) => void;
  onCreateSubActivity: (parentId: number) => void;
  onEditActivity: (activity: Activity) => void;
}

interface TreeNode {
  activity: Activity;
  children: TreeNode[];
  isExpanded: boolean;
}

const HierarchicalActivities: React.FC<HierarchicalActivitiesProps> = ({
  activities,
  onUpdateActivity,
  onDeleteActivity,
  onCreateSubActivity,
  onEditActivity
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  // Build tree structure from flat activities array
  const buildTree = (activities: Activity[]): TreeNode[] => {
    const activityMap = new Map<number, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Create all nodes
    activities.forEach(activity => {
      activityMap.set(activity.id, {
        activity,
        children: [],
        isExpanded: expandedNodes.has(activity.id)
      });
    });

    // Build parent-child relationships
    activities.forEach(activity => {
      const node = activityMap.get(activity.id);
      if (node) {
        if (activity.parentActivityId) {
          const parentNode = activityMap.get(activity.parentActivityId);
          if (parentNode) {
            parentNode.children.push(node);
          }
        } else {
          rootNodes.push(node);
        }
      }
    });

    // Sort children by sortOrder (handle null/undefined values)
    const sortChildren = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        const aOrder = a.activity.sortOrder ?? 0;
        const bOrder = b.activity.sortOrder ?? 0;
        return aOrder - bOrder;
      });
      nodes.forEach(node => sortChildren(node.children));
    };

    sortChildren(rootNodes);
    return rootNodes;
  };

  useEffect(() => {
    setTreeData(buildTree(activities));
  }, [activities, expandedNodes]);

  const toggleExpanded = (activityId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delayed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'not_started': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // Handle reordering within the same parent
    if (source.droppableId === destination.droppableId) {
      const activityId = parseInt(draggableId);
      const newSortOrder = destination.index;
      
      onUpdateActivity(activityId, { sortOrder: newSortOrder });
    } else {
      // Handle moving to different parent
      const activityId = parseInt(draggableId);
      const newParentId = destination.droppableId === 'root' ? null : parseInt(destination.droppableId);
      const newSortOrder = destination.index;
      
      onUpdateActivity(activityId, { 
        parentActivityId: newParentId, 
        sortOrder: newSortOrder,
        level: newParentId ? 1 : 0
      });
    }
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => (
    <Draggable key={node.activity.id} draggableId={node.activity.id.toString()} index={node.activity.sortOrder || 0}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-2 ${snapshot.isDragging ? 'opacity-50' : ''}`}
        >
          <Card className={`transition-all duration-200 ${level > 0 ? 'ml-6 border-l-4 border-blue-200' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div {...provided.dragHandleProps} className="cursor-move p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  {node.children.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(node.activity.id)}
                      className="p-1 h-6 w-6"
                    >
                      {node.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{node.activity.name}</h3>
                        {node.activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">{node.activity.description}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(node.activity.status || 'not_started')}>
                          {node.activity.status || 'not_started'}
                        </Badge>
                        <Badge className={getPriorityColor(node.activity.priority || 'medium')}>
                          {node.activity.priority || 'medium'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{node.activity.responsible}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{node.activity.discipline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(node.activity.plannedStartDate)} - {formatDate(node.activity.plannedEndDate)}</span>
                      </div>
                      {node.activity.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{node.activity.duration} dias</span>
                        </div>
                      )}
                      {node.activity.completionPercentage && (
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600 font-medium">{node.activity.completionPercentage}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditActivity(node.activity)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCreateSubActivity(node.activity.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Subatividade
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteActivity(node.activity.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Delete className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
          
          {node.children.length > 0 && node.isExpanded && (
            <Droppable droppableId={node.activity.id.toString()}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="ml-4">
                  {node.children.map(child => renderTreeNode(child, level + 1))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-4">
        <Droppable droppableId="root">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {treeData.map(node => renderTreeNode(node))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default HierarchicalActivities;
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Settings, 
  Edit2, 
  Eye, 
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Plus,
  GitBranch,
  Move,
  X
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Activity } from "@shared/schema";
import TableConfigModal from "./table-config-modal";
import EditActivityModal from "./edit-activity-modal";
import { ActivityDateEditor } from "./activity-date-editor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ActivityTableProps {
  activities: Activity[];
  customColumns: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterResponsible: string;
  onFilterResponsibleChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  onActivityUpdate: (id: number, data: Partial<Activity>) => void;
  onActivityDelete: (id: number) => void;
  onActivitiesImport: (activities: any[]) => void;
  onCustomColumnsUpdate: () => void;
  onExport: (options: any) => void;
  dashboardId: number;
  onNewActivity?: () => void;
  onManageDependencies?: () => void;
  isReadOnly?: boolean;
  visibleFields?: string[];
}

interface ActivityWithChildren extends Activity {
  children?: ActivityWithChildren[];
  level?: number;
}

export default function ActivityTable({ 
  activities, 
  customColumns, 
  searchTerm, 
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterResponsible,
  onFilterResponsibleChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onActivityUpdate,
  onActivityDelete,
  onActivitiesImport,
  onCustomColumnsUpdate,
  onExport,
  dashboardId,
  onNewActivity,
  onManageDependencies,
  isReadOnly = false,
  visibleFields = []
}: ActivityTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetParentId, setTargetParentId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  // Função para verificar se um campo deve ser visível
  const isFieldVisible = (fieldKey: string) => {
    if (!visibleFields || visibleFields.length === 0) return true; // Se não há configuração, mostra todos
    return visibleFields.includes(fieldKey);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="status-completed font-medium px-3 py-1">Concluído</Badge>;
      case "in_progress":
        return <Badge className="status-in-progress font-medium px-3 py-1">Em Andamento</Badge>;
      case "delayed":
        return <Badge className="status-delayed font-medium px-3 py-1">Atrasado</Badge>;
      case "not_started":
        return <Badge className="status-not-started font-medium px-3 py-1">Não Iniciado</Badge>;
      case "cancelled":
        return <Badge className="status-cancelled font-medium px-3 py-1">Cancelado</Badge>;
      default:
        return <Badge className="status-not-started font-medium px-3 py-1">{status}</Badge>;
    }
  };

  const calculateSPI = (activity: Activity) => {
    const earnedValue = parseFloat(activity.earnedValue || "0");
    const plannedValue = parseFloat(activity.plannedValue || "0");
    return plannedValue > 0 ? (earnedValue / plannedValue).toFixed(2) : "0.00";
  };

  const calculateCPI = (activity: Activity) => {
    const earnedValue = parseFloat(activity.earnedValue || "0");
    const actualCost = parseFloat(activity.actualCost || "0");
    return actualCost > 0 ? (earnedValue / actualCost).toFixed(2) : "0.00";
  };

  // Funções para manipular seleções
  const handleSelectActivity = (activityId: number, checked: boolean) => {
    const newSelected = new Set(selectedActivities);
    if (checked) {
      newSelected.add(activityId);
    } else {
      newSelected.delete(activityId);
    }
    setSelectedActivities(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(flatActivities.map(activity => activity.id));
      setSelectedActivities(allIds);
      setShowBulkActions(true);
    } else {
      setSelectedActivities(new Set());
      setShowBulkActions(false);
    }
  };

  const handleMoveToSubtask = () => {
    if (selectedActivities.size === 0) return;
    setShowMoveModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedActivities.size === 0) return;
    setShowDeleteModal(true);
  };

  const confirmMoveToSubtask = async () => {
    if (!targetParentId || selectedActivities.size === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Processar cada atividade selecionada
      for (const activityId of selectedActivities) {
        await apiRequest('PUT', `/api/activities/${activityId}`, {
          parentActivityId: targetParentId
        });
      }
      
      toast({
        title: "Atividades movidas com sucesso",
        description: `${selectedActivities.size} atividade(s) foram movidas para subtarefas.`,
        variant: "default"
      });
      
      // Limpar seleções e fechar modal
      setSelectedActivities(new Set());
      setShowBulkActions(false);
      setShowMoveModal(false);
      setTargetParentId(null);
      
      // Atualizar dados na interface
      if (onCustomColumnsUpdate) {
        onCustomColumnsUpdate();
      }
    } catch (error: any) {
      console.error('Erro ao mover atividades:', error);
      toast({
        title: "Erro ao mover atividades",
        description: error.message || "Houve um problema ao mover as atividades selecionadas.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedActivities.size === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Processar cada atividade selecionada
      for (const activityId of selectedActivities) {
        await apiRequest('DELETE', `/api/activities/${activityId}`);
      }
      
      toast({
        title: "Atividades excluídas com sucesso",
        description: `${selectedActivities.size} atividade(s) foram excluídas.`,
        variant: "default"
      });
      
      // Limpar seleções e fechar modal
      setSelectedActivities(new Set());
      setShowBulkActions(false);
      setShowDeleteModal(false);
      
      // Atualizar dados na interface
      if (onCustomColumnsUpdate) {
        onCustomColumnsUpdate();
      }
    } catch (error: any) {
      console.error('Erro ao deletar atividades:', error);
      toast({
        title: "Erro ao excluir atividades",
        description: error.message || "Houve um problema ao excluir as atividades selecionadas.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSelection = () => {
    setSelectedActivities(new Set());
    setShowBulkActions(false);
  };

  // Função para criar estrutura hierárquica
  const buildHierarchy = (activities: Activity[]): ActivityWithChildren[] => {
    if (!activities || !Array.isArray(activities)) {
      return [];
    }

    const activityMap = new Map<number, ActivityWithChildren>();
    const rootActivities: ActivityWithChildren[] = [];

    // Criar mapa de atividades
    activities.forEach(activity => {
      activityMap.set(activity.id, {
        ...activity,
        children: [],
        level: 0
      });
    });

    // Construir hierarquia
    activities.forEach(activity => {
      const activityWithChildren = activityMap.get(activity.id);
      if (activityWithChildren) {
        if (activity.parentActivityId) {
          const parent = activityMap.get(activity.parentActivityId);
          if (parent) {
            activityWithChildren.level = (parent.level || 0) + 1;
            parent.children = parent.children || [];
            parent.children.push(activityWithChildren);
          }
        } else {
          rootActivities.push(activityWithChildren);
        }
      }
    });

    return rootActivities;
  };

  // Função para achatar hierarquia em lista para exibição
  const flattenHierarchy = (activities: ActivityWithChildren[]): ActivityWithChildren[] => {
    if (!activities || !Array.isArray(activities)) {
      return [];
    }

    const result: ActivityWithChildren[] = [];
    
    const addToResult = (activity: ActivityWithChildren) => {
      result.push(activity);
      if (expandedRows.has(activity.id) && activity.children && activity.children.length > 0) {
        activity.children.forEach(child => addToResult(child));
      }
    };

    activities.forEach(activity => addToResult(activity));
    return result;
  };

  // Handler para drag and drop
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;

    const activityId = parseInt(draggableId);
    const sourceIndex = source.index;
    const destIndex = destination.index;

    // Se for o mesmo lugar, não fazer nada
    if (sourceIndex === destIndex) return;

    console.log('Drag and drop:', { activityId, sourceIndex, destIndex });

    // Estratégia simples: se arrastou para baixo, torna subatividade da atividade imediatamente anterior
    if (destIndex > sourceIndex) {
      const targetActivity = currentActivities[destIndex - 1];
      if (targetActivity && targetActivity.id !== activityId) {
        console.log(`Tornando atividade ${activityId} subatividade de ${targetActivity.id}`);
        onActivityUpdate(activityId, {
          parentActivityId: targetActivity.id,
          sortOrder: 0
        });
      }
    } else {
      // Se arrastou para cima, remove hierarquia e torna principal
      console.log(`Tornando atividade ${activityId} principal`);
      onActivityUpdate(activityId, {
        parentActivityId: null,
        sortOrder: destIndex
      });
    }
  };

  // Função para alternar expansão de linha
  const toggleExpanded = (activityId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedRows(newExpanded);
  };

  // Processar atividades com hierarquia
  const hierarchicalActivities = buildHierarchy(activities);
  const flatActivities = flattenHierarchy(hierarchicalActivities);
  const totalPages = Math.ceil(flatActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentActivities = flatActivities.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card className="table-enhanced animate-fade-in">
      <CardHeader className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Atividades Recentes
          </h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Buscar atividades..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64 input-enhanced"
              />
            </div>
            {!isReadOnly && (
              <Button 
                variant="default" 
                size="sm"
                onClick={onNewActivity}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Atividade
              </Button>
            )}
            {!isReadOnly && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onManageDependencies}
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Dependências
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Filter className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover-lift focus-ring"
              onClick={() => setConfigModalOpen(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {/* Barra de ações em lote */}
      {showBulkActions && (
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-800">
                {selectedActivities.size} atividade(s) selecionada(s)
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearSelection}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar seleção
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMoveToSubtask}
                className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Move className="w-4 h-4 mr-2" />
                Mover para subtarefas
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBulkDelete}
                className="bg-white border-red-200 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir selecionadas
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <CardContent className="p-0">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium text-muted-foreground w-8">
                    {/* Drag handle column */}
                  </TableHead>
                  <TableHead className="font-medium text-muted-foreground w-12">
                    <Checkbox
                      checked={selectedActivities.size === flatActivities.length && flatActivities.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                      className="ml-2"
                    />
                  </TableHead>
                  {isFieldVisible('name') && (
                    <TableHead className="font-medium text-muted-foreground">
                      Atividade
                    </TableHead>
                  )}
                  {isFieldVisible('discipline') && (
                    <TableHead className="font-medium text-muted-foreground">
                      Disciplina
                    </TableHead>
                  )}
                  {isFieldVisible('responsible') && (
                    <TableHead className="font-medium text-muted-foreground">
                      Responsável
                    </TableHead>
                  )}
                  {isFieldVisible('status') && (
                    <TableHead className="font-medium text-muted-foreground">
                      Status
                    </TableHead>
                  )}
                  {isFieldVisible('completionPercentage') && (
                    <TableHead className="font-medium text-muted-foreground">
                      Progresso
                    </TableHead>
                  )}
                  {isFieldVisible('spi') && (
                    <TableHead className="font-medium text-muted-foreground">
                      SPI
                    </TableHead>
                  )}
                  {isFieldVisible('cpi') && (
                    <TableHead className="font-medium text-muted-foreground">
                      CPI
                    </TableHead>
                  )}
                  {isFieldVisible('actions') && (
                    <TableHead className="font-medium text-muted-foreground">
                      Ações
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <Droppable droppableId="activities-table">
                {(provided) => (
                  <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                    {currentActivities.map((activity, index) => (
                      <Draggable key={activity.id} draggableId={activity.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <TableRow 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            key={activity.id} 
                            className={`table-row hover:bg-table-row-hover transition-colors ${
                              snapshot.isDragging ? 'bg-blue-50 shadow-lg' : ''
                            }`}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                          >
                            <TableCell>
                              <div className="flex items-center">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                checked={selectedActivities.has(activity.id)}
                                onCheckedChange={(checked) => handleSelectActivity(activity.id, checked as boolean)}
                                className="ml-2"
                              />
                            </TableCell>
                            {isFieldVisible('name') && (
                              <TableCell>
                                <div className="flex items-center">
                                  <div style={{ marginLeft: `${(activity.level || 0) * 20}px` }} className="flex items-center">
                                    {activity.children && activity.children.length > 0 ? (
                                      <button
                                        onClick={() => toggleExpanded(activity.id)}
                                        className="mr-2 p-1 hover:bg-gray-100 rounded flex items-center justify-center"
                                      >
                                        {expandedRows.has(activity.id) ? (
                                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        )}
                                      </button>
                                    ) : (
                                      <div className="w-6 h-6 mr-2"></div>
                                    )}
                                    <div>
                                      <div className="font-medium text-foreground">
                                        {activity.name}
                                        {activity.parentActivityId && (
                                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                            Sub
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {activity.startDate && activity.finishDate ? (
                                          <>
                                            {new Date(activity.startDate).toLocaleDateString('pt-BR')} - {new Date(activity.finishDate).toLocaleDateString('pt-BR')}
                                          </>
                                        ) : (
                                          'Datas não definidas'
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            )}
                            {isFieldVisible('discipline') && (
                              <TableCell className="text-foreground">
                                <Badge variant="secondary" className="text-xs">
                                  {activity.discipline || 'Geral'}
                                </Badge>
                              </TableCell>
                            )}
                            {isFieldVisible('responsible') && (
                              <TableCell>
                                <div className="flex items-center">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`} />
                                    <AvatarFallback>
                                      {activity.responsible ? activity.responsible.split(' ').map(n => n[0]).join('') : 'N/A'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-foreground">
                                      {activity.responsible || 'Não atribuído'}
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
                            {isFieldVisible('completionPercentage') && (
                              <TableCell>
                                <div className="flex items-center">
                                  <Progress 
                                    value={parseFloat(activity.completionPercentage || "0")} 
                                    className="w-16 mr-2"
                                  />
                                  <span className="text-sm text-foreground">
                                    {activity.completionPercentage}%
                                  </span>
                                </div>
                              </TableCell>
                            )}
                            {isFieldVisible('spi') && (
                              <TableCell className="text-foreground">
                                <div className="flex items-center">
                                  <span className={`text-sm font-medium ${
                                    parseFloat(calculateSPI(activity)) >= 1 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {calculateSPI(activity)}
                                  </span>
                                  <div className="ml-2 w-2 h-2 rounded-full bg-current opacity-50"></div>
                                </div>
                              </TableCell>
                            )}
                            {isFieldVisible('cpi') && (
                              <TableCell className="text-foreground">
                                <div className="flex items-center">
                                  <span className={`text-sm font-medium ${
                                    parseFloat(calculateCPI(activity)) >= 1 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {calculateCPI(activity)}
                                  </span>
                                  <div className="ml-2 w-2 h-2 rounded-full bg-current opacity-50"></div>
                                </div>
                              </TableCell>
                            )}
                            {isFieldVisible('actions') && (
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-foreground hover-lift focus-ring h-8 w-8"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {!isReadOnly && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-primary hover:text-primary/80 hover-lift focus-ring h-8 w-8"
                                        onClick={() => {
                                          setSelectedActivity(activity);
                                          setEditModalOpen(true);
                                        }}
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                      <ActivityDateEditor
                                        activity={activity}
                                        userId={5} // Luis Ribeiro user ID
                                        onSuccess={() => {
                                          // Não recarregar a página, apenas invalidar queries específicas
                                          // O ActivityDateEditor já faz isso internamente
                                        }}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive/80 hover-lift focus-ring h-8 w-8"
                                        onClick={() => onActivityDelete(activity.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            </Table>
          </div>
        </DragDropContext>
        
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
            <span className="font-medium">
              {Math.min(startIndex + itemsPerPage, flatActivities.length)}
            </span> de{" "}
            <span className="font-medium">{flatActivities.length}</span> resultados
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(1)}
            >
              1
            </Button>
            {totalPages > 1 && (
              <Button
                variant={currentPage === 2 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(2)}
              >
                2
              </Button>
            )}
            {totalPages > 2 && (
              <Button
                variant={currentPage === 3 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(3)}
              >
                3
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </nav>
        </div>
      </CardContent>
      
      {/* Modals */}
      <TableConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        dashboardId={dashboardId}
        customColumns={customColumns}
        activities={activities}
        onCustomColumnsUpdate={onCustomColumnsUpdate}
        onActivitiesImport={onActivitiesImport}
        onExport={onExport}
      />
      
      <EditActivityModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        activity={selectedActivity}
        onSave={onActivityUpdate}
      />
      
      {/* Modal para mover para subtarefas */}
      <Dialog open={showMoveModal} onOpenChange={setShowMoveModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mover para Subtarefas</DialogTitle>
            <DialogDescription>
              Selecione a atividade pai para as {selectedActivities.size} atividades selecionadas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Atividade Pai</label>
              <Select value={targetParentId?.toString()} onValueChange={(value) => setTargetParentId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma atividade pai" />
                </SelectTrigger>
                <SelectContent>
                  {activities
                    .filter(activity => !selectedActivities.has(activity.id))
                    .map((activity) => (
                      <SelectItem key={activity.id} value={activity.id.toString()}>
                        {activity.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowMoveModal(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmMoveToSubtask} disabled={!targetParentId || isProcessing}>
                {isProcessing ? "Processando..." : "Confirmar Movimento"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal para confirmar exclusão em lote */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir as {selectedActivities.size} atividades selecionadas?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Atividades que serão excluídas:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {Array.from(selectedActivities).map(activityId => {
                  const activity = activities.find(a => a.id === activityId);
                  return activity ? (
                    <li key={activityId}>• {activity.name}</li>
                  ) : null;
                })}
              </ul>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmBulkDelete} disabled={isProcessing}>
                {isProcessing ? "Processando..." : "Confirmar Exclusão"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

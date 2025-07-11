import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Calendar, Clock, AlertTriangle, GitBranch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Activity {
  id: number;
  name: string;
  plannedStartDate: Date | null;
  plannedEndDate: Date | null;
  status: string;
  duration: number | null;
  criticalPath: boolean | null;
}

interface ActivityDependency {
  id: number;
  predecessorId: number;
  successorId: number;
  dependencyType: string;
  lagTime: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ActivityConstraint {
  id: number;
  activityId: number;
  constraintType: string;
  constraintDate: Date;
  priority: string;
  description: string | null;
  isActive: boolean;
}

interface DependencyManagerProps {
  dashboardId: number;
  activities: Activity[];
}

export function DependencyManager({ dashboardId, activities }: DependencyManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newDependency, setNewDependency] = useState({
    predecessorId: "",
    successorId: "",
    dependencyType: "finish_to_start",
    lagTime: 0
  });
  const [newConstraint, setNewConstraint] = useState({
    activityId: "",
    constraintType: "start_no_earlier_than",
    constraintDate: "",
    priority: "medium",
    description: ""
  });
  const [activeTab, setActiveTab] = useState<"dependencies" | "constraints" | "schedule">("dependencies");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dependencies
  const { data: dependencies = [], isLoading: loadingDependencies } = useQuery({
    queryKey: ['/api/dashboards', dashboardId, 'dependencies'],
    queryFn: () => apiRequest(`/api/dashboards/${dashboardId}/dependencies`),
    enabled: isOpen
  });

  // Fetch constraints
  const { data: constraints = [], isLoading: loadingConstraints } = useQuery({
    queryKey: ['/api/dashboards', dashboardId, 'constraints'],
    queryFn: () => apiRequest(`/api/dashboards/${dashboardId}/constraints`),
    enabled: isOpen
  });

  // Create dependency mutation
  const createDependencyMutation = useMutation({
    mutationFn: (dependency: any) => apiRequest('/api/activity-dependencies', {
      method: 'POST',
      body: JSON.stringify(dependency)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards', dashboardId, 'dependencies'] });
      setNewDependency({
        predecessorId: "",
        successorId: "",
        dependencyType: "finish_to_start",
        lagTime: 0
      });
      toast({
        title: "Dependência criada",
        description: "A dependência foi criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar dependência",
        description: error.message || "Não foi possível criar a dependência.",
        variant: "destructive",
      });
    }
  });

  // Create constraint mutation
  const createConstraintMutation = useMutation({
    mutationFn: (constraint: any) => apiRequest('/api/activity-constraints', {
      method: 'POST',
      body: JSON.stringify(constraint)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards', dashboardId, 'constraints'] });
      setNewConstraint({
        activityId: "",
        constraintType: "start_no_earlier_than",
        constraintDate: "",
        priority: "medium",
        description: ""
      });
      toast({
        title: "Restrição criada",
        description: "A restrição foi criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar restrição",
        description: error.message || "Não foi possível criar a restrição.",
        variant: "destructive",
      });
    }
  });

  // Delete dependency mutation
  const deleteDependencyMutation = useMutation({
    mutationFn: (dependencyId: number) => apiRequest(`/api/activity-dependencies/${dependencyId}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards', dashboardId, 'dependencies'] });
      toast({
        title: "Dependência removida",
        description: "A dependência foi removida com sucesso.",
      });
    }
  });

  // Delete constraint mutation
  const deleteConstraintMutation = useMutation({
    mutationFn: (constraintId: number) => apiRequest(`/api/activity-constraints/${constraintId}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboards', dashboardId, 'constraints'] });
      toast({
        title: "Restrição removida",
        description: "A restrição foi removida com sucesso.",
      });
    }
  });

  // Recalculate schedule mutation
  const recalculateScheduleMutation = useMutation({
    mutationFn: () => apiRequest(`/api/dashboards/${dashboardId}/recalculate-schedule`, {
      method: 'POST'
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities/dashboard', dashboardId] });
      toast({
        title: "Cronograma recalculado",
        description: `${data.calculations.length} atividades foram atualizadas.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao recalcular cronograma",
        description: error.message || "Não foi possível recalcular o cronograma.",
        variant: "destructive",
      });
    }
  });

  const handleCreateDependency = () => {
    if (!newDependency.predecessorId || !newDependency.successorId) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione as atividades predecessora e sucessora.",
        variant: "destructive",
      });
      return;
    }

    if (newDependency.predecessorId === newDependency.successorId) {
      toast({
        title: "Dependência inválida",
        description: "Uma atividade não pode depender de si mesma.",
        variant: "destructive",
      });
      return;
    }

    createDependencyMutation.mutate({
      predecessorId: parseInt(newDependency.predecessorId),
      successorId: parseInt(newDependency.successorId),
      dependencyType: newDependency.dependencyType,
      lagTime: newDependency.lagTime,
      isActive: true
    });
  };

  const handleCreateConstraint = () => {
    if (!newConstraint.activityId || !newConstraint.constraintDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione a atividade e a data da restrição.",
        variant: "destructive",
      });
      return;
    }

    createConstraintMutation.mutate({
      activityId: parseInt(newConstraint.activityId),
      constraintType: newConstraint.constraintType,
      constraintDate: new Date(newConstraint.constraintDate),
      priority: newConstraint.priority,
      description: newConstraint.description || null,
      isActive: true
    });
  };

  const getActivityName = (activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    return activity ? activity.name : `Atividade ${activityId}`;
  };

  const getDependencyTypeLabel = (type: string) => {
    switch (type) {
      case 'finish_to_start': return 'Fim para Início';
      case 'start_to_start': return 'Início para Início';
      case 'finish_to_finish': return 'Fim para Fim';
      case 'start_to_finish': return 'Início para Fim';
      default: return type;
    }
  };

  const getConstraintTypeLabel = (type: string) => {
    switch (type) {
      case 'must_start_on': return 'Deve iniciar em';
      case 'must_finish_on': return 'Deve terminar em';
      case 'start_no_earlier_than': return 'Não iniciar antes de';
      case 'start_no_later_than': return 'Não iniciar depois de';
      case 'finish_no_earlier_than': return 'Não terminar antes de';
      case 'finish_no_later_than': return 'Não terminar depois de';
      default: return type;
    }
  };

  const criticalPathActivities = activities.filter(a => a.criticalPath);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Gerenciar Dependências
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Gerenciamento de Dependências
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4">
            <button
              onClick={() => setActiveTab("dependencies")}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === "dependencies" 
                  ? "bg-white dark:bg-gray-700 shadow-sm" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Dependências
            </button>
            <button
              onClick={() => setActiveTab("constraints")}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === "constraints" 
                  ? "bg-white dark:bg-gray-700 shadow-sm" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Restrições
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === "schedule" 
                  ? "bg-white dark:bg-gray-700 shadow-sm" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Cronograma
            </button>
          </div>

          <div className="h-full overflow-y-auto">
            {activeTab === "dependencies" && (
              <div className="space-y-4">
                {/* Add Dependency Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nova Dependência</CardTitle>
                    <CardDescription>
                      Defina relacionamentos entre atividades
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="predecessor">Atividade Predecessora</Label>
                        <Select value={newDependency.predecessorId} onValueChange={(value) => 
                          setNewDependency(prev => ({ ...prev, predecessorId: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a atividade" />
                          </SelectTrigger>
                          <SelectContent>
                            {activities.map(activity => (
                              <SelectItem key={activity.id} value={activity.id.toString()}>
                                {activity.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="successor">Atividade Sucessora</Label>
                        <Select value={newDependency.successorId} onValueChange={(value) => 
                          setNewDependency(prev => ({ ...prev, successorId: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a atividade" />
                          </SelectTrigger>
                          <SelectContent>
                            {activities.map(activity => (
                              <SelectItem key={activity.id} value={activity.id.toString()}>
                                {activity.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dependencyType">Tipo de Dependência</Label>
                        <Select value={newDependency.dependencyType} onValueChange={(value) => 
                          setNewDependency(prev => ({ ...prev, dependencyType: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="finish_to_start">Fim para Início</SelectItem>
                            <SelectItem value="start_to_start">Início para Início</SelectItem>
                            <SelectItem value="finish_to_finish">Fim para Fim</SelectItem>
                            <SelectItem value="start_to_finish">Início para Fim</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="lagTime">Tempo de Espera (dias)</Label>
                        <Input
                          type="number"
                          value={newDependency.lagTime}
                          onChange={(e) => setNewDependency(prev => ({ 
                            ...prev, 
                            lagTime: parseInt(e.target.value) || 0 
                          }))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button 
                        onClick={handleCreateDependency}
                        disabled={createDependencyMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Criar Dependência
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Dependencies List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dependências Existentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingDependencies ? (
                      <div className="text-center py-4">Carregando dependências...</div>
                    ) : dependencies.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        Nenhuma dependência configurada
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dependencies.map((dep: ActivityDependency) => (
                          <div key={dep.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">
                                {getActivityName(dep.predecessorId)} → {getActivityName(dep.successorId)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {getDependencyTypeLabel(dep.dependencyType)}
                                {dep.lagTime !== 0 && (
                                  <span className="ml-2">
                                    ({dep.lagTime > 0 ? '+' : ''}{dep.lagTime} dias)
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteDependencyMutation.mutate(dep.id)}
                              disabled={deleteDependencyMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "constraints" && (
              <div className="space-y-4">
                {/* Add Constraint Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nova Restrição</CardTitle>
                    <CardDescription>
                      Defina restrições de data para atividades
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="constraintActivity">Atividade</Label>
                        <Select value={newConstraint.activityId} onValueChange={(value) => 
                          setNewConstraint(prev => ({ ...prev, activityId: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a atividade" />
                          </SelectTrigger>
                          <SelectContent>
                            {activities.map(activity => (
                              <SelectItem key={activity.id} value={activity.id.toString()}>
                                {activity.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="constraintType">Tipo de Restrição</Label>
                        <Select value={newConstraint.constraintType} onValueChange={(value) => 
                          setNewConstraint(prev => ({ ...prev, constraintType: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="must_start_on">Deve iniciar em</SelectItem>
                            <SelectItem value="must_finish_on">Deve terminar em</SelectItem>
                            <SelectItem value="start_no_earlier_than">Não iniciar antes de</SelectItem>
                            <SelectItem value="start_no_later_than">Não iniciar depois de</SelectItem>
                            <SelectItem value="finish_no_earlier_than">Não terminar antes de</SelectItem>
                            <SelectItem value="finish_no_later_than">Não terminar depois de</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="constraintDate">Data</Label>
                        <Input
                          type="date"
                          value={newConstraint.constraintDate}
                          onChange={(e) => setNewConstraint(prev => ({ 
                            ...prev, 
                            constraintDate: e.target.value 
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select value={newConstraint.priority} onValueChange={(value) => 
                          setNewConstraint(prev => ({ ...prev, priority: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                          value={newConstraint.description}
                          onChange={(e) => setNewConstraint(prev => ({ 
                            ...prev, 
                            description: e.target.value 
                          }))}
                          placeholder="Descrição opcional da restrição"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button 
                        onClick={handleCreateConstraint}
                        disabled={createConstraintMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Criar Restrição
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Constraints List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Restrições Existentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingConstraints ? (
                      <div className="text-center py-4">Carregando restrições...</div>
                    ) : constraints.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        Nenhuma restrição configurada
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {constraints.map((constraint: ActivityConstraint) => (
                          <div key={constraint.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">
                                {getActivityName(constraint.activityId)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {getConstraintTypeLabel(constraint.constraintType)}: {' '}
                                {new Date(constraint.constraintDate).toLocaleDateString()}
                              </div>
                              {constraint.description && (
                                <div className="text-sm text-gray-400 mt-1">
                                  {constraint.description}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={constraint.priority === 'high' ? 'destructive' : 'secondary'}>
                                {constraint.priority}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteConstraintMutation.mutate(constraint.id)}
                                disabled={deleteConstraintMutation.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="space-y-4">
                {/* Recalculate Button */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recalcular Cronograma
                    </CardTitle>
                    <CardDescription>
                      Atualize as datas das atividades com base nas dependências e restrições
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => recalculateScheduleMutation.mutate()}
                      disabled={recalculateScheduleMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      {recalculateScheduleMutation.isPending ? 'Recalculando...' : 'Recalcular Cronograma'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Critical Path */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Caminho Crítico
                    </CardTitle>
                    <CardDescription>
                      Atividades que impactam diretamente o prazo do projeto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {criticalPathActivities.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        Nenhuma atividade no caminho crítico
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {criticalPathActivities.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-900/20">
                            <div className="flex-1">
                              <div className="font-medium">{activity.name}</div>
                              <div className="text-sm text-gray-500">
                                {activity.plannedStartDate && activity.plannedEndDate && (
                                  <>
                                    {new Date(activity.plannedStartDate).toLocaleDateString()} - {' '}
                                    {new Date(activity.plannedEndDate).toLocaleDateString()}
                                  </>
                                )}
                              </div>
                            </div>
                            <Badge variant="destructive">
                              Crítico
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
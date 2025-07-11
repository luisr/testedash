import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Network, Plus, Trash2, ArrowRight, AlertCircle, GitBranch } from 'lucide-react';
import { Activity } from '@/../shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DependencyManagerProps {
  dashboardId: number;
  activities: Activity[];
  trigger?: React.ReactNode;
}

interface ActivityDependency {
  id: number;
  activityId: number;
  dependsOnActivityId: number;
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lagTime: number;
  isActive: boolean;
}

export default function DependencyManager({ dashboardId, activities, trigger }: DependencyManagerProps) {
  const [open, setOpen] = useState(false);
  const [dependencies, setDependencies] = useState<ActivityDependency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load dependencies when modal opens
  useEffect(() => {
    if (open) {
      loadDependencies();
    }
  }, [open]);

  const loadDependencies = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest(`/api/dashboards/${dashboardId}/dependencies`);
      setDependencies(response || []);
    } catch (error) {
      console.error('Error loading dependencies:', error);
      toast({
        title: "Erro ao carregar dependências",
        description: "Não foi possível carregar as dependências.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addDependency = async (activityId: number, dependsOnActivityId: number, dependencyType: string) => {
    try {
      const newDependency = {
        activityId,
        dependsOnActivityId,
        dependencyType,
        lagTime: 0,
        isActive: true
      };

      const response = await apiRequest('/api/activity-dependencies', {
        method: 'POST',
        body: JSON.stringify(newDependency),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setDependencies([...dependencies, response]);
      toast({
        title: "Dependência adicionada",
        description: "A dependência foi criada com sucesso."
      });
    } catch (error) {
      console.error('Error adding dependency:', error);
      toast({
        title: "Erro ao adicionar dependência",
        description: "Não foi possível criar a dependência.",
        variant: "destructive"
      });
    }
  };

  const removeDependency = async (dependencyId: number) => {
    try {
      await apiRequest(`/api/activity-dependencies/${dependencyId}`, {
        method: 'DELETE'
      });

      setDependencies(dependencies.filter(dep => dep.id !== dependencyId));
      toast({
        title: "Dependência removida",
        description: "A dependência foi removida com sucesso."
      });
    } catch (error) {
      console.error('Error removing dependency:', error);
      toast({
        title: "Erro ao remover dependência",
        description: "Não foi possível remover a dependência.",
        variant: "destructive"
      });
    }
  };

  const getActivityName = (activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    return activity ? activity.name : 'Atividade não encontrada';
  };

  const getDependencyTypeLabel = (type: string) => {
    const types = {
      'finish_to_start': 'Fim para Início',
      'start_to_start': 'Início para Início',
      'finish_to_finish': 'Fim para Fim',
      'start_to_finish': 'Início para Fim'
    };
    return types[type as keyof typeof types] || type;
  };

  const AddDependencyForm = () => {
    const [selectedActivity, setSelectedActivity] = useState<string>('');
    const [selectedDependency, setSelectedDependency] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('finish_to_start');

    const handleSubmit = () => {
      if (!selectedActivity || !selectedDependency || selectedActivity === selectedDependency) {
        toast({
          title: "Seleção inválida",
          description: "Selecione duas atividades diferentes.",
          variant: "destructive"
        });
        return;
      }

      addDependency(parseInt(selectedActivity), parseInt(selectedDependency), selectedType);
      setSelectedActivity('');
      setSelectedDependency('');
      setSelectedType('finish_to_start');
    };

    return (
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-blue-900">Atividade</label>
              <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Selecione uma atividade" />
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
              <label className="text-sm font-medium mb-2 block text-blue-900">Depende de</label>
              <Select value={selectedDependency} onValueChange={setSelectedDependency}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Selecione a dependência" />
                </SelectTrigger>
                <SelectContent>
                  {activities.filter(a => a.id.toString() !== selectedActivity).map(activity => (
                    <SelectItem key={activity.id} value={activity.id.toString()}>
                      {activity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-blue-900">Tipo de Dependência</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="border-blue-200 focus:border-blue-400">
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

          <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Dependência
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Gerenciar Dependências
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            Gerenciador de Dependências
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add Dependency Form */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-900">Adicionar Nova Dependência</h3>
            <AddDependencyForm />
          </div>

          {/* Existing Dependencies */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-900">Dependências Existentes</h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando dependências...</p>
              </div>
            ) : dependencies.length === 0 ? (
              <Card className="p-8 text-center bg-gray-50">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma dependência encontrada</p>
                <p className="text-sm text-gray-500 mt-2">
                  Adicione dependências para organizar o fluxo de trabalho das atividades
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {dependencies.map(dependency => (
                  <Card key={dependency.id} className="p-4 bg-white border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {getActivityName(dependency.activityId)}
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                          <Badge variant="outline" className="border-blue-200 text-blue-700">
                            {getActivityName(dependency.dependsOnActivityId)}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200">
                          {getDependencyTypeLabel(dependency.dependencyType)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDependency(dependency.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
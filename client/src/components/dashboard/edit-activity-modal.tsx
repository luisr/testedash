import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, Save, X, AlertCircle } from "lucide-react";
import { Activity, InsertActivity } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onSave: (id: number, data: Partial<Activity>) => void;
}

export default function EditActivityModal({ isOpen, onClose, activity, onSave }: EditActivityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discipline: '',
    responsible: '',
    priority: 'medium',
    status: 'not_started',
    plannedStartDate: '',
    plannedEndDate: '',
    actualStartDate: '',
    actualEndDate: '',
    baselineStartDate: '',
    baselineEndDate: '',
    plannedValue: '',
    actualCost: '',
    earnedValue: '',
    completionPercentage: '',
    associatedRisk: '',
    requiredResources: [] as string[],
    dependencies: [] as string[],
    documentLink: ''
  });
  
  const [newResource, setNewResource] = useState('');
  const [newDependency, setNewDependency] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name || '',
        description: activity.description || '',
        discipline: activity.discipline || '',
        responsible: activity.responsible || '',
        priority: activity.priority || 'medium',
        status: activity.status || 'not_started',
        plannedStartDate: activity.plannedStartDate ? new Date(activity.plannedStartDate).toISOString().split('T')[0] : '',
        plannedEndDate: activity.plannedEndDate ? new Date(activity.plannedEndDate).toISOString().split('T')[0] : '',
        actualStartDate: activity.actualStartDate ? new Date(activity.actualStartDate).toISOString().split('T')[0] : '',
        actualEndDate: activity.actualEndDate ? new Date(activity.actualEndDate).toISOString().split('T')[0] : '',
        baselineStartDate: activity.baselineStartDate ? new Date(activity.baselineStartDate).toISOString().split('T')[0] : '',
        baselineEndDate: activity.baselineEndDate ? new Date(activity.baselineEndDate).toISOString().split('T')[0] : '',
        plannedValue: activity.plannedValue?.toString() || '',
        actualCost: activity.actualCost?.toString() || '',
        earnedValue: activity.earnedValue?.toString() || '',
        completionPercentage: activity.completionPercentage?.toString() || '',
        associatedRisk: activity.associatedRisk || '',
        requiredResources: activity.requiredResources || [],
        dependencies: activity.dependencies || [],
        documentLink: activity.documentLink || ''
      });
    }
  }, [activity]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.discipline.trim()) {
      newErrors.discipline = 'Disciplina é obrigatória';
    }
    
    if (!formData.responsible.trim()) {
      newErrors.responsible = 'Responsável é obrigatório';
    }
    
    if (formData.plannedStartDate && formData.plannedEndDate) {
      if (new Date(formData.plannedStartDate) > new Date(formData.plannedEndDate)) {
        newErrors.plannedEndDate = 'Data de fim deve ser posterior à data de início';
      }
    }
    
    if (formData.actualStartDate && formData.actualEndDate) {
      if (new Date(formData.actualStartDate) > new Date(formData.actualEndDate)) {
        newErrors.actualEndDate = 'Data de fim real deve ser posterior à data de início real';
      }
    }
    
    if (formData.completionPercentage) {
      const percentage = parseFloat(formData.completionPercentage);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        newErrors.completionPercentage = 'Percentual deve estar entre 0 e 100';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !activity) return;
    
    const updateData: Partial<Activity> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      discipline: formData.discipline.trim(),
      responsible: formData.responsible.trim(),
      priority: formData.priority as any,
      status: formData.status as any,
      plannedStartDate: formData.plannedStartDate ? new Date(formData.plannedStartDate) : null,
      plannedEndDate: formData.plannedEndDate ? new Date(formData.plannedEndDate) : null,
      actualStartDate: formData.actualStartDate ? new Date(formData.actualStartDate) : null,
      actualEndDate: formData.actualEndDate ? new Date(formData.actualEndDate) : null,
      baselineStartDate: formData.baselineStartDate ? new Date(formData.baselineStartDate) : null,
      baselineEndDate: formData.baselineEndDate ? new Date(formData.baselineEndDate) : null,
      plannedValue: formData.plannedValue ? String(formData.plannedValue) : "0.00",
      actualCost: formData.actualCost ? String(formData.actualCost) : "0.00",
      earnedValue: formData.earnedValue ? String(formData.earnedValue) : "0.00",
      completionPercentage: formData.completionPercentage ? String(formData.completionPercentage) : "0.00",
      associatedRisk: formData.associatedRisk.trim(),
      requiredResources: formData.requiredResources,
      dependencies: formData.dependencies,
      documentLink: formData.documentLink.trim()
    };
    
    console.log('EditActivityModal: Saving activity with data:', updateData);
    try {
      await onSave(activity.id, updateData);
      onClose();
      
      toast({
        title: "Sucesso",
        description: "Atividade atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar atividade. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const addResource = () => {
    if (newResource.trim()) {
      setFormData({
        ...formData,
        requiredResources: [...formData.requiredResources, newResource.trim()]
      });
      setNewResource('');
    }
  };

  const removeResource = (index: number) => {
    setFormData({
      ...formData,
      requiredResources: formData.requiredResources.filter((_, i) => i !== index)
    });
  };

  const addDependency = () => {
    if (newDependency.trim()) {
      setFormData({
        ...formData,
        dependencies: [...formData.dependencies, newDependency.trim()]
      });
      setNewDependency('');
    }
  };

  const removeDependency = (index: number) => {
    setFormData({
      ...formData,
      dependencies: formData.dependencies.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-primary" />
            Editar Atividade
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discipline">Disciplina *</Label>
                  <Input
                    id="discipline"
                    value={formData.discipline}
                    onChange={(e) => setFormData({...formData, discipline: e.target.value})}
                    className={errors.discipline ? 'border-red-500' : ''}
                  />
                  {errors.discipline && <p className="text-sm text-red-500">{errors.discipline}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsible">Responsável *</Label>
                  <Input
                    id="responsible"
                    value={formData.responsible}
                    onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                    className={errors.responsible ? 'border-red-500' : ''}
                  />
                  {errors.responsible && <p className="text-sm text-red-500">{errors.responsible}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Não Iniciado</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="delayed">Atrasado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plannedStartDate">Data Início Planejada</Label>
                  <Input
                    id="plannedStartDate"
                    type="date"
                    value={formData.plannedStartDate}
                    onChange={(e) => setFormData({...formData, plannedStartDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plannedEndDate">Data Fim Planejada</Label>
                  <Input
                    id="plannedEndDate"
                    type="date"
                    value={formData.plannedEndDate}
                    onChange={(e) => setFormData({...formData, plannedEndDate: e.target.value})}
                    className={errors.plannedEndDate ? 'border-red-500' : ''}
                  />
                  {errors.plannedEndDate && <p className="text-sm text-red-500">{errors.plannedEndDate}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actualStartDate">Data Início Real</Label>
                  <Input
                    id="actualStartDate"
                    type="date"
                    value={formData.actualStartDate}
                    onChange={(e) => setFormData({...formData, actualStartDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="actualEndDate">Data Fim Real</Label>
                  <Input
                    id="actualEndDate"
                    type="date"
                    value={formData.actualEndDate}
                    onChange={(e) => setFormData({...formData, actualEndDate: e.target.value})}
                    className={errors.actualEndDate ? 'border-red-500' : ''}
                  />
                  {errors.actualEndDate && <p className="text-sm text-red-500">{errors.actualEndDate}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações Financeiras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plannedValue">Valor Planejado</Label>
                  <Input
                    id="plannedValue"
                    type="number"
                    step="0.01"
                    value={formData.plannedValue}
                    onChange={(e) => setFormData({...formData, plannedValue: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="actualCost">Custo Real</Label>
                  <Input
                    id="actualCost"
                    type="number"
                    step="0.01"
                    value={formData.actualCost}
                    onChange={(e) => setFormData({...formData, actualCost: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="earnedValue">Valor Agregado</Label>
                  <Input
                    id="earnedValue"
                    type="number"
                    step="0.01"
                    value={formData.earnedValue}
                    onChange={(e) => setFormData({...formData, earnedValue: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="completionPercentage">Percentual de Conclusão (%)</Label>
                  <Input
                    id="completionPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.completionPercentage}
                    onChange={(e) => setFormData({...formData, completionPercentage: e.target.value})}
                    className={errors.completionPercentage ? 'border-red-500' : ''}
                  />
                  {errors.completionPercentage && <p className="text-sm text-red-500">{errors.completionPercentage}</p>}
                  {formData.completionPercentage && (
                    <Progress value={parseFloat(formData.completionPercentage)} className="mt-2" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="associatedRisk">Risco Associado</Label>
                  <Input
                    id="associatedRisk"
                    value={formData.associatedRisk}
                    onChange={(e) => setFormData({...formData, associatedRisk: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Resources and Dependencies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recursos e Dependências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Recursos Necessários</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Adicionar recurso"
                        value={newResource}
                        onChange={(e) => setNewResource(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                      />
                      <Button type="button" onClick={addResource} variant="outline">
                        Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredResources.map((resource, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {resource}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeResource(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Dependências</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Adicionar dependência"
                        value={newDependency}
                        onChange={(e) => setNewDependency(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDependency())}
                      />
                      <Button type="button" onClick={addDependency} variant="outline">
                        Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.dependencies.map((dependency, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {dependency}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeDependency(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentLink">Link do Documento</Label>
                <Input
                  id="documentLink"
                  type="url"
                  value={formData.documentLink}
                  onChange={(e) => setFormData({...formData, documentLink: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
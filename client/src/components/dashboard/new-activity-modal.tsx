import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CalendarDays, DollarSign, User, FolderOpen, AlertCircle } from "lucide-react";
import { Project, Activity } from "@shared/schema";

interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activityData: any) => void;
  projects: Project[];
  activities?: Activity[];
}

export default function NewActivityModal({ isOpen, onClose, onSubmit, projects, activities = [] }: NewActivityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectId: '',
    parentActivityId: '',
    discipline: '',
    responsible: '',
    priority: 'medium',
    status: 'not_started',
    plannedStartDate: '',
    plannedEndDate: '',
    plannedValue: '',
    associatedRisk: 'baixo',
    requiredResources: '',
    dependencies: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const activityData = {
      ...formData,
      projectId: formData.projectId ? parseInt(formData.projectId) : null,
      parentActivityId: formData.parentActivityId ? parseInt(formData.parentActivityId) : null,
      plannedValue: formData.plannedValue || '0',
      actualCost: '0',
      earnedValue: '0',
      completionPercentage: '0',
      requiredResources: formData.requiredResources ? formData.requiredResources.split(',').map(r => r.trim()) : [],
      dependencies: formData.dependencies ? formData.dependencies.split(',').map(d => d.trim()) : [],
      plannedStartDate: formData.plannedStartDate ? new Date(formData.plannedStartDate) : null,
      plannedEndDate: formData.plannedEndDate ? new Date(formData.plannedEndDate) : null
    };
    
    onSubmit(activityData);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      projectId: '',
      parentActivityId: '',
      discipline: '',
      responsible: '',
      priority: 'medium',
      status: 'not_started',
      plannedStartDate: '',
      plannedEndDate: '',
      plannedValue: '',
      associatedRisk: 'baixo',
      requiredResources: '',
      dependencies: ''
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Nova Atividade
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Atividade *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome da atividade"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discipline">Disciplina *</Label>
              <Select value={formData.discipline} onValueChange={(value) => handleInputChange('discipline', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Análise">Análise</SelectItem>
                  <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="Testes">Testes</SelectItem>
                  <SelectItem value="Implantação">Implantação</SelectItem>
                  <SelectItem value="Gerenciamento">Gerenciamento</SelectItem>
                  <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                  <SelectItem value="Documentação">Documentação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva a atividade"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">Projeto</Label>
              <Select value={formData.projectId} onValueChange={(value) => handleInputChange('projectId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parentActivityId">Atividade Pai (Opcional)</Label>
              <Select value={formData.parentActivityId} onValueChange={(value) => handleInputChange('parentActivityId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione para criar subatividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma (Atividade Principal)</SelectItem>
                  {activities.filter(activity => !activity.parentActivityId).map(activity => (
                    <SelectItem key={activity.id} value={activity.id.toString()}>
                      {activity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => handleInputChange('responsible', e.target.value)}
                  placeholder="Nome do responsável"
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Não Iniciada</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="delayed">Atrasada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedStartDate">Data Início Planejada</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="plannedStartDate"
                  type="date"
                  value={formData.plannedStartDate}
                  onChange={(e) => handleInputChange('plannedStartDate', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plannedEndDate">Data Fim Planejada</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="plannedEndDate"
                  type="date"
                  value={formData.plannedEndDate}
                  onChange={(e) => handleInputChange('plannedEndDate', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedValue">Valor Planejado</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="plannedValue"
                  type="number"
                  value={formData.plannedValue}
                  onChange={(e) => handleInputChange('plannedValue', e.target.value)}
                  placeholder="0.00"
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="associatedRisk">Risco Associado</Label>
              <Select value={formData.associatedRisk} onValueChange={(value) => handleInputChange('associatedRisk', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="médio">Médio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="crítico">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredResources">Recursos Necessários</Label>
            <Input
              id="requiredResources"
              value={formData.requiredResources}
              onChange={(e) => handleInputChange('requiredResources', e.target.value)}
              placeholder="Separe os recursos por vírgula"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dependencies">Dependências</Label>
            <Input
              id="dependencies"
              value={formData.dependencies}
              onChange={(e) => handleInputChange('dependencies', e.target.value)}
              placeholder="Separe as dependências por vírgula"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Criar Atividade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
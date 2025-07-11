import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { Project, Activity } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activities: Activity[];
  onCreateProject: (projectData: any) => void;
  onUpdateProject: (id: number, projectData: any) => void;
  onDeleteProject: (id: number) => void;
}

export default function ProjectsModal({ 
  isOpen, 
  onClose, 
  projects, 
  activities, 
  onCreateProject, 
  onUpdateProject, 
  onDeleteProject 
}: ProjectsModalProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    budget: '',
    client: '',
    manager: ''
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleCreateProject = () => {
    if (!newProject.name) return;
    
    const projectData = {
      ...newProject,
      budget: newProject.budget ? parseFloat(newProject.budget) : 0,
      startDate: newProject.startDate ? new Date(newProject.startDate) : null,
      endDate: newProject.endDate ? new Date(newProject.endDate) : null
    };
    
    onCreateProject(projectData);
    
    // Reset form
    setNewProject({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      budget: '',
      client: '',
      manager: ''
    });
    
    setActiveTab("list");
  };

  const handleUpdateProject = () => {
    if (!editingProject) return;
    
    const projectData = {
      ...newProject,
      budget: newProject.budget ? parseFloat(newProject.budget) : 0,
      startDate: newProject.startDate ? new Date(newProject.startDate) : null,
      endDate: newProject.endDate ? new Date(newProject.endDate) : null
    };
    
    onUpdateProject(editingProject.id, projectData);
    setEditingProject(null);
    setActiveTab("list");
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description || '',
      status: project.status || 'planning',
      priority: project.priority || 'medium',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      budget: project.budget ? project.budget.toString() : '',
      client: project.client || '',
      manager: project.manager || ''
    });
    setActiveTab("form");
  };

  const cancelEdit = () => {
    setEditingProject(null);
    setNewProject({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      budget: '',
      client: '',
      manager: ''
    });
    setActiveTab("list");
  };

  const getProjectActivities = (projectId: number) => {
    return activities.filter(activity => activity.projectId === projectId);
  };

  const getProjectCompletion = (projectId: number) => {
    const projectActivities = getProjectActivities(projectId);
    if (projectActivities.length === 0) return 0;
    
    const totalCompletion = projectActivities.reduce((sum, activity) => {
      return sum + (parseFloat(activity.completionPercentage) || 0);
    }, 0);
    
    return totalCompletion / projectActivities.length;
  };

  const getProjectBudgetUsed = (projectId: number) => {
    const projectActivities = getProjectActivities(projectId);
    return projectActivities.reduce((sum, activity) => {
      return sum + (parseFloat(activity.actualCost) || 0);
    }, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Gerenciamento de Projetos
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Lista de Projetos</TabsTrigger>
            <TabsTrigger value="form">
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Projetos ({projects.length})</h3>
              <Button 
                onClick={() => setActiveTab("form")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Projeto
              </Button>
            </div>

            <div className="space-y-4">
              {projects.map(project => {
                const completion = getProjectCompletion(project.id);
                const budgetUsed = getProjectBudgetUsed(project.id);
                const projectActivities = getProjectActivities(project.id);
                
                return (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(project.status || 'planning')}>
                            {project.status === 'planning' ? 'Planejamento' :
                             project.status === 'active' ? 'Ativo' :
                             project.status === 'on_hold' ? 'Pausado' :
                             project.status === 'completed' ? 'Concluído' :
                             project.status === 'cancelled' ? 'Cancelado' : 'Desconhecido'}
                          </Badge>
                          <Badge className={getPriorityColor(project.priority || 'medium')}>
                            {project.priority === 'low' ? 'Baixa' :
                             project.priority === 'medium' ? 'Média' :
                             project.priority === 'high' ? 'Alta' :
                             project.priority === 'critical' ? 'Crítica' : 'Média'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Início</p>
                            <p className="text-sm font-medium">
                              {project.startDate ? formatDate(project.startDate.toString()) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Fim</p>
                            <p className="text-sm font-medium">
                              {project.endDate ? formatDate(project.endDate.toString()) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Orçamento</p>
                            <p className="text-sm font-medium">{formatCurrency(project.budget)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Atividades</p>
                            <p className="text-sm font-medium">{projectActivities.length}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Progresso</span>
                          <span className="text-sm font-medium">{completion.toFixed(1)}%</span>
                        </div>
                        <Progress value={completion} className="h-2" />
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Cliente: {project.client || 'N/A'}</span>
                          <span>Gerente: {project.manager || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditProject(project)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDeleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Nome do Projeto *</Label>
                  <Input
                    id="projectName"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="Digite o nome do projeto"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Input
                    id="client"
                    value={newProject.client}
                    onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                    placeholder="Nome do cliente"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Descreva o projeto"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newProject.status} onValueChange={(value) => setNewProject({...newProject, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planejamento</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="on_hold">Pausado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={newProject.priority} onValueChange={(value) => setNewProject({...newProject, priority: value})}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Orçamento</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manager">Gerente do Projeto</Label>
                  <Input
                    id="manager"
                    value={newProject.manager}
                    onChange={(e) => setNewProject({...newProject, manager: e.target.value})}
                    placeholder="Nome do gerente"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={cancelEdit}>
                  Cancelar
                </Button>
                <Button 
                  onClick={editingProject ? handleUpdateProject : handleCreateProject}
                  disabled={!newProject.name}
                >
                  {editingProject ? 'Atualizar' : 'Criar'} Projeto
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Projetos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Projetos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'active').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Projetos Concluídos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'completed').length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
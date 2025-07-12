import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Folder, Plus, Search, Settings, Trash2, Calendar, DollarSign } from "lucide-react";
import { Project } from "@shared/schema";
import { CreateProjectModal } from "./create-project-modal";

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: number;
}

export function ProjectsModal({ isOpen, onClose, dashboardId }: ProjectsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: isOpen,
  });

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativo", variant: "default" as const },
      completed: { label: "Concluído", variant: "secondary" as const },
      on_hold: { label: "Pausado", variant: "destructive" as const },
      planning: { label: "Planejamento", variant: "outline" as const },
    };
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "outline" as const };
  };

  const calculateProgress = (project: Project) => {
    // Implementar cálculo de progresso baseado nas atividades
    return Math.floor(Math.random() * 100); // Placeholder
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Gerenciamento de Projetos
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 h-full">
            {/* Barra de pesquisa e ações */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button 
                onClick={() => setCreateProjectModalOpen(true)}
                className="beachpark-btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </div>

            {/* Lista de projetos */}
            <div className="flex-1 overflow-y-auto beachpark-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Carregando projetos...</div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredProjects.map((project) => (
                    <Card key={project.id} className="beachpark-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{project.name}</h3>
                              <Badge variant={getStatusBadge(project.status).variant}>
                                {getStatusBadge(project.status).label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {project.description}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'Não definido'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {project.budget ? `R$ ${parseFloat(project.budget).toLocaleString('pt-BR')}` : 'Não definido'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Progresso</span>
                                <span className="text-sm text-muted-foreground">
                                  {calculateProgress(project)}%
                                </span>
                              </div>
                              <Progress value={calculateProgress(project)} className="h-2" />
                            </div>
                          </div>

                          <div className="flex items-center gap-1 ml-4">
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateProjectModal
        isOpen={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
      />
    </>
  );
}
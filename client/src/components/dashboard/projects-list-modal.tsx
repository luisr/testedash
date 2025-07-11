import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Calendar, DollarSign, Users, Edit2, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectsListModalProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onNewProject?: () => void;
  dashboardId: number;
}

export function ProjectsListModal({ trigger, isOpen, onOpenChange, onNewProject, dashboardId }: ProjectsListModalProps) {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: [`/api/projects/dashboard/${dashboardId}`],
    queryFn: async () => {
      const response = await fetch(`/api/projects/dashboard/${dashboardId}`);
      if (!response.ok) throw new Error("Erro ao carregar projetos");
      return response.json();
    },
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planning": return "Planejamento";
      case "active": return "Ativo";
      case "on_hold": return "Pausado";
      case "completed": return "Concluído";
      default: return status;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200";
      case "on_hold": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
      case "completed": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200";
    }
  };

  const calculateProgress = (project: any) => {
    if (!project.budget || !project.actualCost) return 0;
    const budget = parseFloat(project.budget);
    const actualCost = parseFloat(project.actualCost);
    return Math.min((actualCost / budget) * 100, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Projetos do Dashboard
            </div>
            <Button onClick={onNewProject} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Projeto
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum projeto encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project: any) => (
                <div
                  key={project.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-lg">{project.name}</h4>
                        <Badge className={getStatusBadgeColor(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                      
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {project.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Orçamento
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Planejado: R$ {parseFloat(project.budget || '0').toLocaleString('pt-BR')}</span>
                          <span>Gasto: R$ {parseFloat(project.actualCost || '0').toLocaleString('pt-BR')}</span>
                        </div>
                        <Progress value={calculateProgress(project)} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Cronograma
                      </div>
                      <div className="text-sm">
                        {project.startDate && project.endDate ? (
                          <>
                            <div>Início: {format(new Date(project.startDate), "dd/MM/yyyy", { locale: ptBR })}</div>
                            <div>Fim: {format(new Date(project.endDate), "dd/MM/yyyy", { locale: ptBR })}</div>
                          </>
                        ) : (
                          <div className="text-muted-foreground">Datas não definidas</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Gerente
                      </div>
                      <div className="text-sm">
                        {project.manager ? project.manager.name : "Não definido"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
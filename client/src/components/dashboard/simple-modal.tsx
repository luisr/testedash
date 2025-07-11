import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Users, FileText, BarChart3, Target, CheckCircle } from "lucide-react";
import { Project, Activity, User } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'projects' | 'users' | 'reports';
  projects?: Project[];
  activities?: Activity[];
  users?: User[];
}

export default function SimpleModal({ 
  isOpen, 
  onClose, 
  type, 
  projects = [], 
  activities = [], 
  users = [] 
}: SimpleModalProps) {
  const getTitle = () => {
    switch (type) {
      case 'projects': return 'Gerenciamento de Projetos';
      case 'users': return 'Gerenciamento de Usuários';
      case 'reports': return 'Relatórios e Análises';
      default: return 'Modal';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'projects': return <FolderOpen className="h-5 w-5 text-primary" />;
      case 'users': return <Users className="h-5 w-5 text-primary" />;
      case 'reports': return <FileText className="h-5 w-5 text-primary" />;
      default: return null;
    }
  };

  const renderProjectsContent = () => (
    <div className="space-y-4">
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

      <div className="space-y-4">
        {projects.map(project => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {project.status === 'planning' ? 'Planejamento' :
                     project.status === 'active' ? 'Ativo' :
                     project.status === 'completed' ? 'Concluído' : 'Desconhecido'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Orçamento</p>
                  <p className="text-sm font-medium">{formatCurrency(project.budget)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Início</p>
                  <p className="text-sm font-medium">
                    {project.startDate ? formatDate(project.startDate.toString()) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fim</p>
                  <p className="text-sm font-medium">
                    {project.endDate ? formatDate(project.endDate.toString()) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderUsersContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usuários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'user').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Sistema de gerenciamento de usuários em desenvolvimento.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Funcionalidades completas serão implementadas em breve.
        </p>
      </div>
    </div>
  );

  const renderReportsContent = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.status === 'completed').length;
    const overallProgress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Projetos Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <div className="text-xs text-muted-foreground">
                {activeProjects} ativos, {completedProjects} concluídos
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Atividades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActivities}</div>
              <div className="text-xs text-muted-foreground">
                {completedActivities} concluídas ({overallProgress.toFixed(1)}%)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Progresso Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">
                {totalActivities > 0 ? 'Em andamento' : 'Sem atividades'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-xs text-muted-foreground">
                Sistema em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status das Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: 'Não Iniciadas', count: activities.filter(a => a.status === 'not_started').length, color: 'bg-gray-500' },
                { status: 'Em Andamento', count: activities.filter(a => a.status === 'in_progress').length, color: 'bg-blue-500' },
                { status: 'Concluídas', count: completedActivities, color: 'bg-green-500' },
                { status: 'Atrasadas', count: activities.filter(a => a.status === 'delayed').length, color: 'bg-red-500' },
                { status: 'Canceladas', count: activities.filter(a => a.status === 'cancelled').length, color: 'bg-gray-400' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm">{item.status}</span>
                  </div>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'projects': return renderProjectsContent();
      case 'users': return renderUsersContent();
      case 'reports': return renderReportsContent();
      default: return <div>Conteúdo não encontrado</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        {renderContent()}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
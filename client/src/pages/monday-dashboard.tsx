import { MondayLayout } from "@/components/layout/MondayLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/monday-card";
import { Badge } from "@/components/ui/monday-badge";
import { Button } from "@/components/ui/monday-button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FolderOpen, 
  Calendar,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export default function MondayDashboard() {
  return (
    <MondayLayout>
      <div className="p-xl space-y-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-secondary">Visão geral dos seus projetos</p>
          </div>
          <div className="flex gap-sm">
            <Button variant="secondary">
              <Calendar className="w-4 h-4" />
              Calendário
            </Button>
            <Button variant="primary">
              <FolderOpen className="w-4 h-4" />
              Novo Projeto
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <p className="text-sm font-medium text-secondary">Projetos Ativos</p>
                <p className="text-2xl font-bold text-primary">12</p>
              </div>
              <div className="bg-primary rounded-lg p-sm">
                <FolderOpen className="w-4 h-4 text-on-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-xs text-sm">
                <ArrowUp className="w-3 h-3 text-success" />
                <span className="text-success font-medium">+2</span>
                <span className="text-tertiary">este mês</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <p className="text-sm font-medium text-secondary">Tarefas Concluídas</p>
                <p className="text-2xl font-bold text-primary">284</p>
              </div>
              <div className="bg-secondary rounded-lg p-sm">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-xs text-sm">
                <ArrowUp className="w-3 h-3 text-success" />
                <span className="text-success font-medium">+12%</span>
                <span className="text-tertiary">vs mês passado</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <p className="text-sm font-medium text-secondary">Equipe Ativa</p>
                <p className="text-2xl font-bold text-primary">24</p>
              </div>
              <div className="bg-accent rounded-lg p-sm">
                <Users className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-xs text-sm">
                <ArrowUp className="w-3 h-3 text-success" />
                <span className="text-success font-medium">+3</span>
                <span className="text-tertiary">novos colaboradores</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <p className="text-sm font-medium text-secondary">Performance</p>
                <p className="text-2xl font-bold text-primary">94%</p>
              </div>
              <div className="bg-success rounded-lg p-sm">
                <TrendingUp className="w-4 h-4 text-on-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-xs text-sm">
                <ArrowUp className="w-3 h-3 text-success" />
                <span className="text-success font-medium">+5%</span>
                <span className="text-tertiary">eficiência</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Projects Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <BarChart3 className="w-5 h-5 brand-primary" />
                Projetos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-md">
                {[
                  {
                    name: "Sistema de Vendas",
                    status: "in_progress",
                    progress: 75,
                    team: 8,
                    deadline: "15 Jan 2025"
                  },
                  {
                    name: "App Mobile",
                    status: "completed",
                    progress: 100,
                    team: 5,
                    deadline: "10 Jan 2025"
                  },
                  {
                    name: "Dashboard Analytics",
                    status: "in_progress",
                    progress: 45,
                    team: 6,
                    deadline: "28 Jan 2025"
                  },
                  {
                    name: "API Gateway",
                    status: "delayed",
                    progress: 30,
                    team: 4,
                    deadline: "12 Jan 2025"
                  }
                ].map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-md bg-tertiary rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-sm mb-xs">
                        <h4 className="font-medium text-primary">{project.name}</h4>
                        <Badge 
                          variant={
                            project.status === 'completed' ? 'success' :
                            project.status === 'delayed' ? 'error' : 'primary'
                          }
                        >
                          {project.status === 'completed' ? 'Concluído' :
                           project.status === 'delayed' ? 'Atrasado' : 'Em Andamento'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-md text-sm text-secondary mb-sm">
                        <span>Equipe: {project.team}</span>
                        <span>Prazo: {project.deadline}</span>
                      </div>
                      <div>
                        <div className="progress">
                          <div 
                            className={`progress-bar ${project.status === 'completed' ? 'progress-success' : project.status === 'delayed' ? 'progress-error' : ''}`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-tertiary mt-xs block">{project.progress}% concluído</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <Clock className="w-5 h-5 brand-primary" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-md">
                {[
                  {
                    user: "Ana Silva",
                    action: "concluiu a tarefa",
                    target: "Implementar API",
                    time: "2h atrás",
                    type: "success"
                  },
                  {
                    user: "João Santos",
                    action: "criou projeto",
                    target: "Sistema de Vendas",
                    time: "5h atrás",
                    type: "info"
                  },
                  {
                    user: "Maria Costa",
                    action: "reportou problema",
                    target: "Bug no login",
                    time: "1d atrás",
                    type: "warning"
                  },
                  {
                    user: "Pedro Lima",
                    action: "atualizou documento",
                    target: "Especificações",
                    time: "2d atrás",
                    type: "info"
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-sm">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-success' :
                      activity.type === 'warning' ? 'bg-warning' : 'bg-primary'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-primary">
                        <strong>{activity.user}</strong> {activity.action}{' '}
                        <span className="brand-primary">{activity.target}</span>
                      </p>
                      <p className="text-xs text-tertiary">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
              <Button variant="primary" className="h-auto p-lg flex-col gap-sm">
                <FolderOpen className="w-6 h-6" />
                <span>Novo Projeto</span>
              </Button>
              <Button variant="secondary" className="h-auto p-lg flex-col gap-sm">
                <Users className="w-6 h-6" />
                <span>Gerenciar Equipe</span>
              </Button>
              <Button variant="secondary" className="h-auto p-lg flex-col gap-sm">
                <BarChart3 className="w-6 h-6" />
                <span>Ver Relatórios</span>
              </Button>
              <Button variant="secondary" className="h-auto p-lg flex-col gap-sm">
                <Calendar className="w-6 h-6" />
                <span>Agendar Reunião</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MondayLayout>
  );
}
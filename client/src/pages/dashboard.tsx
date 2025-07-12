import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-new";
import { Badge } from "@/components/ui/badge-new";
import { Button } from "@/components/ui/button-new";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FolderOpen, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div className="p-lg space-y-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-white/70">Visão geral dos seus projetos</p>
          </div>
          <div className="flex gap-sm">
            <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Calendar className="w-4 h-4 mr-2" />
              Calendário
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
              <FolderOpen className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          <Card className="hover-lift" style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Projetos Ativos
              </CardTitle>
              <FolderOpen className="w-4 h-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">12</div>
              <p className="text-xs text-white/70">
                <span className="text-green-400">+2</span> este mês
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift" style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Tarefas Concluídas
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">284</div>
              <p className="text-xs text-white/70">
                <span className="text-green-400">+12%</span> vs mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift" style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Equipe Ativa
              </CardTitle>
              <Users className="w-4 h-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">24</div>
              <p className="text-xs text-white/70">
                <span className="text-cyan-400">+3</span> novos colaboradores
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift" style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Performance
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">94%</div>
              <p className="text-xs text-white/70">
                <span className="text-green-400">+5%</span> eficiência
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Projects Overview */}
          <Card className="lg:col-span-2" style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="w-5 h-5" />
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
                  <div key={index} className="flex items-center justify-between p-md bg-white/10 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{project.name}</h4>
                        <Badge 
                          variant={
                            project.status === 'completed' ? 'success' :
                            project.status === 'delayed' ? 'error' : 'info'
                          }
                        >
                          {project.status === 'completed' ? 'Concluído' :
                           project.status === 'delayed' ? 'Atrasado' : 'Em Andamento'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <span>Equipe: {project.team}</span>
                        <span>Prazo: {project.deadline}</span>
                      </div>
                      <div className="mt-2">
                        <div className="progress">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-white/70 mt-1">{project.progress}% concluído</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5" />
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
                  <div key={index} className="flex items-start gap-3 p-sm bg-white/5 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-success' :
                      activity.type === 'warning' ? 'bg-warning' : 'bg-info'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        <strong>{activity.user}</strong> {activity.action}{' '}
                        <span className="text-cyan-400">{activity.target}</span>
                      </p>
                      <p className="text-xs text-white/70">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card style={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white'
        }}>
          <CardHeader>
            <CardTitle className="text-white">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
              <Button className="h-auto p-md flex-col gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                <FolderOpen className="w-6 h-6" />
                <span>Novo Projeto</span>
              </Button>
              <Button variant="secondary" className="h-auto p-md flex-col gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Users className="w-6 h-6" />
                <span>Gerenciar Equipe</span>
              </Button>
              <Button variant="secondary" className="h-auto p-md flex-col gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20">
                <BarChart3 className="w-6 h-6" />
                <span>Ver Relatórios</span>
              </Button>
              <Button variant="secondary" className="h-auto p-md flex-col gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Calendar className="w-6 h-6" />
                <span>Agendar Reunião</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
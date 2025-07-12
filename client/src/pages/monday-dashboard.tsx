import { MondayLayout } from "@/components/layout/MondayLayout";
import { useState } from "react";
import { useLocation } from "wouter";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FolderOpen, 
  Calendar,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Plus,
  Settings
} from "lucide-react";

export default function MondayDashboard() {
  const [, setLocation] = useLocation();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  const handleNewProject = () => {
    setShowNewProjectModal(true);
  };

  const handleManageTeam = () => {
    setLocation('/users');
  };

  const handleViewReports = () => {
    setLocation('/reports');
  };

  const handleScheduleMeeting = () => {
    setLocation('/calendar');
  };

  return (
    <MondayLayout>
      <div className="monday-main">
        {/* Header */}
        <div className="monday-header">
          <div>
            <h1 className="monday-title">Dashboard</h1>
            <p className="monday-subtitle">Visão geral dos seus projetos</p>
          </div>
          <div className="monday-flex monday-gap-sm">
            <button 
              className="monday-btn monday-btn-secondary"
              onClick={() => handleNavigation('/calendar')}
            >
              <Calendar className="w-4 h-4" />
              Calendário
            </button>
            <button 
              className="monday-btn monday-btn-primary"
              onClick={handleNewProject}
            >
              <FolderOpen className="w-4 h-4" />
              Novo Projeto
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="monday-grid monday-grid-cols-1 monday-md-grid-cols-2 monday-lg-grid-cols-4">
          <div className="monday-kpi-card">
            <div className="monday-flex monday-items-center monday-justify-between monday-mb-sm">
              <div>
                <p className="monday-kpi-label">Projetos Ativos</p>
                <p className="monday-kpi-value">12</p>
              </div>
              <div className="monday-rounded-lg monday-p-sm" style={{ backgroundColor: 'var(--monday-primary)' }}>
                <FolderOpen className="w-4 h-4" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="monday-kpi-change positive">
              <ArrowUp className="w-3 h-3" />
              <span className="monday-font-medium">+2</span>
              <span>este mês</span>
            </div>
          </div>

          <div className="monday-kpi-card">
            <div className="monday-flex monday-items-center monday-justify-between monday-mb-sm">
              <div>
                <p className="monday-kpi-label">Tarefas Concluídas</p>
                <p className="monday-kpi-value">284</p>
              </div>
              <div className="monday-rounded-lg monday-p-sm" style={{ backgroundColor: 'var(--monday-secondary)' }}>
                <CheckCircle className="w-4 h-4" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="monday-kpi-change positive">
              <ArrowUp className="w-3 h-3" />
              <span className="monday-font-medium">+12%</span>
              <span>vs mês passado</span>
            </div>
          </div>

          <div className="monday-kpi-card">
            <div className="monday-flex monday-items-center monday-justify-between monday-mb-sm">
              <div>
                <p className="monday-kpi-label">Equipe Ativa</p>
                <p className="monday-kpi-value">24</p>
              </div>
              <div className="monday-rounded-lg monday-p-sm" style={{ backgroundColor: 'var(--monday-accent)' }}>
                <Users className="w-4 h-4" style={{ color: 'var(--monday-text-primary)' }} />
              </div>
            </div>
            <div className="monday-kpi-change positive">
              <ArrowUp className="w-3 h-3" />
              <span className="monday-font-medium">+3</span>
              <span>novos colaboradores</span>
            </div>
          </div>

          <div className="monday-kpi-card">
            <div className="monday-flex monday-items-center monday-justify-between monday-mb-sm">
              <div>
                <p className="monday-kpi-label">Performance</p>
                <p className="monday-kpi-value">94%</p>
              </div>
              <div className="monday-rounded-lg monday-p-sm" style={{ backgroundColor: 'var(--monday-secondary)' }}>
                <TrendingUp className="w-4 h-4" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="monday-kpi-change positive">
              <ArrowUp className="w-3 h-3" />
              <span className="monday-font-medium">+5%</span>
              <span>eficiência</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="monday-grid monday-grid-cols-1 monday-lg-grid-cols-3">
          {/* Projects Overview */}
          <div className="monday-card" style={{ gridColumn: 'span 2' }}>
            <div className="monday-card-header">
              <h3 className="monday-card-title monday-flex monday-items-center monday-gap-sm">
                <BarChart3 className="w-5 h-5" style={{ color: 'var(--monday-primary)' }} />
                Projetos Recentes
              </h3>
            </div>
            <div className="monday-card-content">
              <div className="monday-flex monday-flex-col monday-gap-md">
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
                  <div key={index} className="monday-flex monday-items-center monday-justify-between monday-p-md monday-rounded-lg" style={{ backgroundColor: 'var(--monday-bg-tertiary)' }}>
                    <div className="monday-flex-1">
                      <div className="monday-flex monday-items-center monday-gap-sm monday-mb-xs">
                        <h4 className="monday-font-medium" style={{ color: 'var(--monday-text-primary)' }}>{project.name}</h4>
                        <span className={`monday-badge ${
                          project.status === 'completed' ? 'success' :
                          project.status === 'delayed' ? 'error' : 'primary'
                        }`}>
                          {project.status === 'completed' ? 'Concluído' :
                           project.status === 'delayed' ? 'Atrasado' : 'Em Andamento'}
                        </span>
                      </div>
                      <div className="monday-flex monday-items-center monday-gap-md monday-text-sm monday-mb-sm" style={{ color: 'var(--monday-text-secondary)' }}>
                        <span>Equipe: {project.team}</span>
                        <span>Prazo: {project.deadline}</span>
                      </div>
                      <div>
                        <div className="monday-progress">
                          <div 
                            className={`monday-progress-bar ${project.status === 'completed' ? 'success' : project.status === 'delayed' ? 'error' : ''}`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="monday-text-xs monday-mt-xs" style={{ color: 'var(--monday-text-tertiary)', display: 'block' }}>{project.progress}% concluído</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="monday-card">
            <div className="monday-card-header">
              <h3 className="monday-card-title monday-flex monday-items-center monday-gap-sm">
                <Clock className="w-5 h-5" style={{ color: 'var(--monday-primary)' }} />
                Atividades Recentes
              </h3>
            </div>
            <div className="monday-card-content">
              <div className="monday-flex monday-flex-col monday-gap-md">
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
                  <div key={index} className="monday-flex monday-items-start monday-gap-sm">
                    <div 
                      className="monday-rounded-full" 
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        marginTop: '8px',
                        backgroundColor: activity.type === 'success' ? 'var(--monday-secondary)' :
                                      activity.type === 'warning' ? 'var(--monday-accent)' : 'var(--monday-primary)'
                      }}
                    ></div>
                    <div className="monday-flex-1">
                      <p className="monday-text-sm" style={{ color: 'var(--monday-text-primary)' }}>
                        <strong>{activity.user}</strong> {activity.action}{' '}
                        <span style={{ color: 'var(--monday-primary)' }}>{activity.target}</span>
                      </p>
                      <p className="monday-text-xs" style={{ color: 'var(--monday-text-tertiary)' }}>{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="monday-card">
          <div className="monday-card-header">
            <h3 className="monday-card-title">Ações Rápidas</h3>
          </div>
          <div className="monday-card-content">
            <div className="monday-grid monday-grid-cols-1 monday-md-grid-cols-4">
              <button 
                className="monday-btn monday-btn-primary monday-flex monday-flex-col monday-gap-sm monday-p-lg"
                onClick={handleNewProject}
              >
                <FolderOpen className="w-6 h-6" />
                <span>Novo Projeto</span>
              </button>
              <button 
                className="monday-btn monday-btn-secondary monday-flex monday-flex-col monday-gap-sm monday-p-lg"
                onClick={handleManageTeam}
              >
                <Users className="w-6 h-6" />
                <span>Gerenciar Equipe</span>
              </button>
              <button 
                className="monday-btn monday-btn-secondary monday-flex monday-flex-col monday-gap-sm monday-p-lg"
                onClick={handleViewReports}
              >
                <BarChart3 className="w-6 h-6" />
                <span>Ver Relatórios</span>
              </button>
              <button 
                className="monday-btn monday-btn-secondary monday-flex monday-flex-col monday-gap-sm monday-p-lg"
                onClick={handleScheduleMeeting}
              >
                <Calendar className="w-6 h-6" />
                <span>Agendar Reunião</span>
              </button>
            </div>
          </div>
        </div>

        {/* New Project Modal */}
        {showNewProjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 monday-flex monday-items-center monday-justify-center" style={{ zIndex: 1000 }}>
            <div className="monday-card" style={{ maxWidth: '400px', width: '90%' }}>
              <div className="monday-card-header">
                <h3 className="monday-card-title">Novo Projeto</h3>
                <p className="monday-card-description">Crie um novo projeto para sua equipe</p>
              </div>
              <div className="monday-card-content">
                <div className="monday-flex monday-flex-col monday-gap-md">
                  <button 
                    className="monday-btn monday-btn-primary"
                    onClick={() => {
                      setShowNewProjectModal(false);
                      setLocation('/projects');
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Criar Projeto
                  </button>
                  <button 
                    className="monday-btn monday-btn-secondary"
                    onClick={() => setShowNewProjectModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MondayLayout>
  );
}
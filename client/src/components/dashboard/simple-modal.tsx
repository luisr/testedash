import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderOpen, Users, FileText, BarChart3, Target, CheckCircle, Upload, Calendar, Clock, TrendingUp } from "lucide-react";
import { Project, Activity, User } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'projects' | 'users' | 'reports' | 'import' | 'schedule';
  projects?: Project[];
  activities?: Activity[];
  users?: User[];
  dashboardId?: number;
}

export default function SimpleModal({ 
  isOpen, 
  onClose, 
  type, 
  projects = [], 
  activities = [], 
  users = [],
  dashboardId = 1
}: SimpleModalProps) {
  const [loadedUsers, setLoadedUsers] = useState<User[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Load users from API when modal opens
  useEffect(() => {
    if (isOpen && type === 'users') {
      loadUsers();
    }
  }, [isOpen, type]);

  const loadUsers = async () => {
    try {
      const response = await apiRequest("GET", "/api/users");
      const usersData = await response.json();
      setLoadedUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) return;

    setIsImporting(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        alert('Arquivo CSV deve ter pelo menos uma linha de cabeçalho e uma linha de dados.');
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const activities = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length >= 1 && values[0]) {
          const activity = {
            name: values[0] || `Atividade ${i}`,
            description: values[1] || '',
            discipline: values[2] || 'Geral',
            responsible: values[3] || 'Não definido',
            priority: ['low', 'medium', 'high', 'critical'].includes(values[4]) ? values[4] : 'medium',
            status: ['not_started', 'in_progress', 'completed', 'delayed', 'cancelled'].includes(values[5]) ? values[5] : 'not_started',
            plannedCost: values[6] || '0',
            actualCost: values[7] || '0',
            completionPercentage: Math.max(0, Math.min(100, parseInt(values[8]) || 0)),
            plannedStartDate: values[9] ? new Date(values[9]).toISOString().split('T')[0] : null,
            plannedFinishDate: values[10] ? new Date(values[10]).toISOString().split('T')[0] : null,
            actualStartDate: values[11] ? new Date(values[11]).toISOString().split('T')[0] : null,
            actualFinishDate: values[12] ? new Date(values[12]).toISOString().split('T')[0] : null,
            dashboardId: dashboardId
          };
          activities.push(activity);
        }
      }

      if (activities.length > 0) {
        const response = await apiRequest("POST", "/api/activities/import", {
          dashboardId: dashboardId,
          activities: activities
        });
        
        if (response.ok) {
          const result = await response.json();
          alert(`Importação concluída! ${result.activities.length} atividades foram importadas.`);
          onClose();
        } else {
          throw new Error('Erro na importação');
        }
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Erro ao importar arquivo CSV. Verifique o formato do arquivo.');
    } finally {
      setIsImporting(false);
    }
  };
  const getTitle = () => {
    switch (type) {
      case 'projects': return 'Gerenciamento de Projetos';
      case 'users': return 'Gerenciamento de Usuários';
      case 'reports': return 'Relatórios e Análises';
      case 'import': return 'Importar Atividades';
      case 'schedule': return 'Cronograma';
      default: return 'Modal';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'projects': return <FolderOpen className="h-5 w-5 text-primary" />;
      case 'users': return <Users className="h-5 w-5 text-primary" />;
      case 'reports': return <FileText className="h-5 w-5 text-primary" />;
      case 'import': return <Upload className="h-5 w-5 text-primary" />;
      case 'schedule': return <Calendar className="h-5 w-5 text-primary" />;
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

  const renderUsersContent = () => {
    const usersToShow = loadedUsers.length > 0 ? loadedUsers : users;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersToShow.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Administradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {usersToShow.filter(u => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Usuários Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {usersToShow.filter(u => u.role === 'user').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {usersToShow.map(user => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' :
                       user.role === 'manager' ? 'Gerente' : 'Usuário'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Departamento</p>
                    <p className="text-sm font-medium">{user.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cargo</p>
                    <p className="text-sm font-medium">{user.position || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

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

  const renderImportContent = () => (
    <div className="space-y-4">
      <div className="text-center py-4">
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Importar Atividades via CSV</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Importe múltiplas atividades de uma vez usando um arquivo CSV.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formato do Arquivo CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            O arquivo deve conter as seguintes colunas (nesta ordem):
          </p>
          <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono">
            nome,descricao,disciplina,responsavel,prioridade,status,valor_planejado
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Exemplo: "Análise de Requisitos,Levantamento inicial,Análise,João Silva,high,not_started,5000"
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <Label htmlFor="csv-file">Selecionar arquivo CSV</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className="mt-1"
          />
        </div>

        {csvFile && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Arquivo selecionado: {csvFile.name}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Tamanho: {(csvFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}

        <Button 
          onClick={handleImportCSV} 
          disabled={!csvFile || isImporting}
          className="w-full"
        >
          {isImporting ? 'Importando...' : 'Importar Atividades'}
        </Button>
      </div>
    </div>
  );

  const renderScheduleContent = () => {
    const activitiesWithDates = activities.filter(a => a.plannedStartDate && a.plannedEndDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Cronograma de Atividades</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Visualização temporal das atividades planejadas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Atividades Agendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activitiesWithDates.length}</div>
              <div className="text-xs text-muted-foreground">
                De {activities.length} total
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Prazo Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activitiesWithDates.length > 0 ? 
                  Math.round(activitiesWithDates.reduce((acc, a) => {
                    const start = new Date(a.plannedStartDate!);
                    const end = new Date(a.plannedEndDate!);
                    return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
                  }, 0) / activitiesWithDates.length) : 0
                } dias
              </div>
              <div className="text-xs text-muted-foreground">
                Duração média
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                No Prazo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {activitiesWithDates.filter(a => a.status !== 'delayed').length}
              </div>
              <div className="text-xs text-muted-foreground">
                Atividades
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activitiesWithDates
                .sort((a, b) => new Date(a.plannedStartDate!).getTime() - new Date(b.plannedStartDate!).getTime())
                .slice(0, 5)
                .map(activity => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.responsible} • {activity.discipline}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatDate(activity.plannedStartDate!)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Início previsto
                      </div>
                    </div>
                  </div>
                ))}
              {activitiesWithDates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma atividade com datas planejadas</p>
                  <p className="text-sm">Configure datas nas atividades para ver o cronograma</p>
                </div>
              )}
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
      case 'import': return renderImportContent();
      case 'schedule': return renderScheduleContent();
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
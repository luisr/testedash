import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Target,
  Award
} from "lucide-react";
import { Project, Activity, User } from "@shared/schema";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/utils";

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activities: Activity[];
  users: User[];
}

export default function ReportsModal({ 
  isOpen, 
  onClose, 
  projects, 
  activities, 
  users 
}: ReportsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalActivities = activities.length;
  const completedActivities = activities.filter(a => a.status === 'completed').length;
  const inProgressActivities = activities.filter(a => a.status === 'in_progress').length;
  const delayedActivities = activities.filter(a => a.status === 'delayed').length;
  
  const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.budget?.toString() || '0') || 0), 0);
  const totalActualCost = activities.reduce((sum, a) => sum + (parseFloat(a.actualCost) || 0), 0);
  const totalPlannedValue = activities.reduce((sum, a) => sum + (parseFloat(a.plannedValue) || 0), 0);
  const totalEarnedValue = activities.reduce((sum, a) => sum + (parseFloat(a.earnedValue) || 0), 0);
  
  const overallProgress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
  const budgetUtilization = totalBudget > 0 ? (totalActualCost / totalBudget) * 100 : 0;
  const spi = totalPlannedValue > 0 ? totalEarnedValue / totalPlannedValue : 0;
  const cpi = totalActualCost > 0 ? totalEarnedValue / totalActualCost : 0;

  // Activity by status
  const activityByStatus = [
    { status: 'Não Iniciadas', count: activities.filter(a => a.status === 'not_started').length, color: 'bg-gray-500' },
    { status: 'Em Andamento', count: inProgressActivities, color: 'bg-blue-500' },
    { status: 'Concluídas', count: completedActivities, color: 'bg-green-500' },
    { status: 'Atrasadas', count: delayedActivities, color: 'bg-red-500' },
    { status: 'Canceladas', count: activities.filter(a => a.status === 'cancelled').length, color: 'bg-gray-400' }
  ];

  // Activity by discipline
  const disciplineStats = activities.reduce((acc: any, activity) => {
    if (!acc[activity.discipline]) {
      acc[activity.discipline] = { total: 0, completed: 0 };
    }
    acc[activity.discipline].total++;
    if (activity.status === 'completed') {
      acc[activity.discipline].completed++;
    }
    return acc;
  }, {});

  const disciplineData = Object.keys(disciplineStats).map(discipline => ({
    discipline,
    total: disciplineStats[discipline].total,
    completed: disciplineStats[discipline].completed,
    progress: disciplineStats[discipline].total > 0 ? (disciplineStats[discipline].completed / disciplineStats[discipline].total) * 100 : 0
  }));

  // Top performers
  const performerStats = activities.reduce((acc: any, activity) => {
    if (!acc[activity.responsible]) {
      acc[activity.responsible] = { total: 0, completed: 0 };
    }
    acc[activity.responsible].total++;
    if (activity.status === 'completed') {
      acc[activity.responsible].completed++;
    }
    return acc;
  }, {});

  const topPerformers = Object.keys(performerStats)
    .map(responsible => ({
      responsible,
      total: performerStats[responsible].total,
      completed: performerStats[responsible].completed,
      completionRate: performerStats[responsible].total > 0 ? (performerStats[responsible].completed / performerStats[responsible].total) * 100 : 0
    }))
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 5);

  const exportReport = (type: string) => {
    // Mock export functionality
    const reportData = {
      overview: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalActivities,
        completedActivities,
        overallProgress,
        budgetUtilization,
        spi,
        cpi
      },
      activities: activityByStatus,
      disciplines: disciplineData,
      performers: topPerformers
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `relatorio_${type}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Relatórios e Análises
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Resumo Executivo</h3>
              <Button onClick={() => exportReport('overview')} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>

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
                    {completedActivities} concluídas ({formatPercentage(overallProgress)})
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    SPI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{spi.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {spi > 1 ? 'Adiantado' : spi < 1 ? 'Atrasado' : 'No prazo'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    CPI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cpi.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {cpi > 1 ? 'Abaixo orçamento' : cpi < 1 ? 'Acima orçamento' : 'No orçamento'}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progresso Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Conclusão de Atividades</span>
                      <span className="text-sm font-medium">{formatPercentage(overallProgress)}</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Utilização do Orçamento</span>
                      <span className="text-sm font-medium">{formatPercentage(budgetUtilization)}</span>
                    </div>
                    <Progress value={budgetUtilization} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status das Atividades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityByStatus.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm">{item.status}</span>
                        </div>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Análise de Atividades</h3>
              <Button onClick={() => exportReport('activities')} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Atividades por Disciplina</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {disciplineData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.discipline}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.completed}/{item.total} ({formatPercentage(item.progress)})
                        </span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividades Críticas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Atividade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Prazo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities
                      .filter(a => a.priority === 'critical' || a.status === 'delayed')
                      .slice(0, 5)
                      .map(activity => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">{activity.name}</TableCell>
                          <TableCell>
                            <Badge variant={activity.status === 'delayed' ? 'destructive' : 'secondary'}>
                              {activity.status === 'not_started' ? 'Não Iniciada' :
                               activity.status === 'in_progress' ? 'Em Andamento' :
                               activity.status === 'completed' ? 'Concluída' :
                               activity.status === 'delayed' ? 'Atrasada' :
                               activity.status === 'cancelled' ? 'Cancelada' : 'Desconhecido'}
                            </Badge>
                          </TableCell>
                          <TableCell>{activity.responsible}</TableCell>
                          <TableCell>
                            {activity.plannedEndDate ? formatDate(activity.plannedEndDate.toString()) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Análise de Performance</h3>
              <Button onClick={() => exportReport('performance')} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{performer.responsible}</p>
                          <p className="text-sm text-muted-foreground">
                            {performer.completed} de {performer.total} atividades
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPercentage(performer.completionRate)}</p>
                        <div className="w-20 h-2 bg-muted rounded-full mt-1">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${performer.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Análise Financeira</h3>
              <Button onClick={() => exportReport('financial')} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Orçamento Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Custo Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalActualCost)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Valor Agregado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalEarnedValue)}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Custos por Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Orçamento</TableHead>
                      <TableHead>Custo Real</TableHead>
                      <TableHead>Variação</TableHead>
                      <TableHead>% Utilização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map(project => {
                      const projectCost = activities
                        .filter(a => a.projectId === project.id)
                        .reduce((sum, a) => sum + (parseFloat(a.actualCost) || 0), 0);
                      const budget = parseFloat(project.budget?.toString() || '0') || 0;
                      const variance = budget - projectCost;
                      const utilization = budget > 0 ? (projectCost / budget) * 100 : 0;
                      
                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{formatCurrency(budget)}</TableCell>
                          <TableCell>{formatCurrency(projectCost)}</TableCell>
                          <TableCell className={variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(variance)}
                          </TableCell>
                          <TableCell>{formatPercentage(utilization)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
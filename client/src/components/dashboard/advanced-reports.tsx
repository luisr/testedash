import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Project } from '@shared/schema';
import { 
  FileBarChart, 
  Download, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Calendar,
  Clock,
  DollarSign,
  Users,
  Star,
  MapPin,
  Activity as ActivityIcon,
  BarChart3,
  PieChart,
  LineChart,
  Brain,
  Lightbulb
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AdvancedReportsProps {
  activities: Activity[];
  projects: Project[];
  dashboardId: number;
}

interface CriticalPathActivity {
  id: number;
  name: string;
  earlyStart: Date;
  earlyFinish: Date;
  lateStart: Date;
  lateFinish: Date;
  totalFloat: number;
  isCritical: boolean;
  duration: number;
}

interface KPIData {
  spi: number;
  cpi: number;
  completionRate: number;
  budgetVariance: number;
  scheduleVariance: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export default function AdvancedReports({ activities, projects, dashboardId }: AdvancedReportsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [geminiObservations, setGeminiObservations] = useState<string>('');
  const [loadingObservations, setLoadingObservations] = useState(false);
  const { toast } = useToast();

  // Calculate Critical Path
  const criticalPathAnalysis = useMemo(() => {
    const analysisData: CriticalPathActivity[] = activities.map(activity => {
      const startDate = activity.actualStartDate ? new Date(activity.actualStartDate) : 
                       activity.plannedStartDate ? new Date(activity.plannedStartDate) : new Date();
      const duration = activity.plannedDuration || 1;
      const finishDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
      
      return {
        id: activity.id,
        name: activity.name,
        earlyStart: startDate,
        earlyFinish: finishDate,
        lateStart: startDate,
        lateFinish: finishDate,
        totalFloat: 0,
        isCritical: activity.priority === 'critical' || activity.status === 'delayed',
        duration: duration
      };
    });

    const criticalPath = analysisData.filter(item => item.isCritical);
    const totalProjectDuration = Math.max(...analysisData.map(item => 
      (item.earlyFinish.getTime() - item.earlyStart.getTime()) / (24 * 60 * 60 * 1000)
    ));

    return {
      activities: analysisData,
      criticalPath,
      totalDuration: totalProjectDuration,
      criticalPathLength: criticalPath.length
    };
  }, [activities]);

  // Calculate KPIs
  const kpiData = useMemo((): KPIData => {
    const totalPlannedCost = activities.reduce((sum, act) => sum + (act.plannedCost || 0), 0);
    const totalActualCost = activities.reduce((sum, act) => sum + (act.actualCost || 0), 0);
    const completedActivities = activities.filter(act => act.status === 'completed').length;
    const totalActivities = activities.length;
    
    const plannedValue = totalPlannedCost * (completedActivities / totalActivities);
    const earnedValue = activities.reduce((sum, act) => {
      const completion = act.completionPercentage || 0;
      return sum + (act.plannedCost || 0) * (completion / 100);
    }, 0);
    
    const spi = plannedValue > 0 ? earnedValue / plannedValue : 0;
    const cpi = totalActualCost > 0 ? earnedValue / totalActualCost : 0;
    const completionRate = (completedActivities / totalActivities) * 100;
    const budgetVariance = ((earnedValue - totalActualCost) / totalPlannedCost) * 100;
    const scheduleVariance = ((earnedValue - plannedValue) / totalPlannedCost) * 100;
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (spi < 0.8 || cpi < 0.8) riskLevel = 'critical';
    else if (spi < 0.9 || cpi < 0.9) riskLevel = 'high';
    else if (spi < 0.95 || cpi < 0.95) riskLevel = 'medium';
    
    return {
      spi: Number(spi.toFixed(2)),
      cpi: Number(cpi.toFixed(2)),
      completionRate: Number(completionRate.toFixed(1)),
      budgetVariance: Number(budgetVariance.toFixed(1)),
      scheduleVariance: Number(scheduleVariance.toFixed(1)),
      riskLevel
    };
  }, [activities]);

  // Roadmap Data
  const roadmapData = useMemo(() => {
    const milestones = activities.filter(act => act.isMilestone);
    const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
    
    const roadmapByQuarter = quarters.map(quarter => {
      const quarterActivities = activities.filter(act => {
        if (!act.plannedStartDate) return false;
        const date = new Date(act.plannedStartDate);
        const month = date.getMonth();
        const quarterIndex = Math.floor(month / 3);
        return quarters[quarterIndex] === quarter;
      });
      
      return {
        quarter,
        activities: quarterActivities.length,
        milestones: quarterActivities.filter(act => act.isMilestone).length,
        completionRate: quarterActivities.length > 0 ? 
          (quarterActivities.filter(act => act.status === 'completed').length / quarterActivities.length) * 100 : 0
      };
    });
    
    return { milestones, roadmapByQuarter };
  }, [activities]);

  const generateGeminiObservations = async () => {
    setLoadingObservations(true);
    try {
      const reportData = {
        kpis: kpiData,
        criticalPath: criticalPathAnalysis,
        roadmap: roadmapData,
        activities: activities.map(act => ({
          name: act.name,
          status: act.status,
          priority: act.priority,
          completion: act.completionPercentage,
          plannedCost: act.plannedCost,
          actualCost: act.actualCost,
          responsible: act.responsible,
          discipline: act.discipline
        })),
        projects: projects.map(proj => ({
          name: proj.name,
          status: proj.status,
          budget: proj.budget,
          description: proj.description
        }))
      };

      console.log('Sending request to Gemini API with data:', reportData);

      const response = await fetch('/api/reports/gemini-observations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data: reportData,
          reportType: 'advanced-analysis'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Response from Gemini API:', data);
      console.log('Response type:', typeof data);
      console.log('Response observations:', data?.observations);
      
      if (data && data.observations) {
        console.log('Setting observations:', data.observations);
        setGeminiObservations(data.observations);
        toast({
          title: "Observações geradas com sucesso",
          description: "As observações da IA foram geradas e estão prontas para visualização.",
        });
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      console.error('Error generating Gemini observations:', error);
      toast({
        title: "Erro ao gerar observações",
        description: "Não foi possível gerar as observações da IA. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingObservations(false);
    }
  };

  const downloadReport = async (reportType: string) => {
    setGeneratingReport(true);
    try {
      const reportData = {
        kpis: kpiData,
        criticalPath: criticalPathAnalysis,
        roadmap: roadmapData,
        activities,
        projects,
        geminiObservations,
        dashboardId
      };

      const response = await fetch('/api/reports/advanced-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          data: reportData,
          reportType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${reportType}-dashboard-${dashboardId}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Relatório gerado com sucesso",
        description: `O relatório ${reportType} foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskLevelLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Baixo';
      case 'medium': return 'Médio';
      case 'high': return 'Alto';
      case 'critical': return 'Crítico';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relatórios Avançados</h2>
          <p className="text-muted-foreground">Análise completa com caminho crítico, KPIs e observações IA</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={generateGeminiObservations}
            disabled={loadingObservations}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            {loadingObservations ? 'Gerando...' : 'Gerar Observações IA'}
          </Button>
          <Button
            onClick={() => downloadReport('complete')}
            disabled={generatingReport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {generatingReport ? 'Gerando...' : 'Baixar Relatório'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="critical-path" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Caminho Crítico
          </TabsTrigger>
          <TabsTrigger value="kpis" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            KPIs Gráficos
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Roadmap
          </TabsTrigger>
          <TabsTrigger value="observations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Observações IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="w-5 h-5" />
                Resumo Executivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Atividades</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{kpiData.completionRate}%</div>
                  <div className="text-sm text-muted-foreground">Conclusão</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{criticalPathAnalysis.criticalPathLength}</div>
                  <div className="text-sm text-muted-foreground">Atividades Críticas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{roadmapData.milestones.length}</div>
                  <div className="text-sm text-muted-foreground">Marcos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Avaliação de Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">Nível de Risco do Projeto</h4>
                  <p className="text-sm text-muted-foreground">
                    Baseado em SPI, CPI e status das atividades
                  </p>
                </div>
                <Badge className={getRiskLevelColor(kpiData.riskLevel)}>
                  {getRiskLevelLabel(kpiData.riskLevel)}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">SPI (Schedule Performance Index)</span>
                  <span className={`font-semibold ${kpiData.spi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpiData.spi}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CPI (Cost Performance Index)</span>
                  <span className={`font-semibold ${kpiData.cpi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpiData.cpi}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Variação do Cronograma</span>
                  <span className={`font-semibold ${kpiData.scheduleVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpiData.scheduleVariance > 0 ? '+' : ''}{kpiData.scheduleVariance}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Variação do Orçamento</span>
                  <span className={`font-semibold ${kpiData.budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpiData.budgetVariance > 0 ? '+' : ''}{kpiData.budgetVariance}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical-path" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Análise do Caminho Crítico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{criticalPathAnalysis.criticalPathLength}</div>
                    <div className="text-sm text-red-800">Atividades Críticas</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{criticalPathAnalysis.totalDuration}</div>
                    <div className="text-sm text-blue-800">Duração Total (dias)</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {((criticalPathAnalysis.criticalPathLength / criticalPathAnalysis.activities.length) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-yellow-800">% Atividades Críticas</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Atividades do Caminho Crítico</h4>
                  {criticalPathAnalysis.criticalPath.map((activity) => (
                    <div key={activity.id} className="p-4 border-l-4 border-l-red-500 bg-red-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-red-800">{activity.name}</h5>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            <div>
                              <span className="text-red-600">Início: </span>
                              <span>{formatDate(activity.earlyStart)}</span>
                            </div>
                            <div>
                              <span className="text-red-600">Fim: </span>
                              <span>{formatDate(activity.earlyFinish)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge variant="destructive">Crítico</Badge>
                          <span className="text-sm text-red-600 mt-1">{activity.duration} dias</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Performance de Cronograma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>SPI (Schedule Performance Index)</span>
                    <span className={`font-bold text-lg ${kpiData.spi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpiData.spi}
                    </span>
                  </div>
                  <Progress value={kpiData.spi * 100} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {kpiData.spi >= 1 ? 'Projeto dentro do cronograma' : 'Projeto atrasado'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Performance de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>CPI (Cost Performance Index)</span>
                    <span className={`font-bold text-lg ${kpiData.cpi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpiData.cpi}
                    </span>
                  </div>
                  <Progress value={kpiData.cpi * 100} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {kpiData.cpi >= 1 ? 'Projeto dentro do orçamento' : 'Projeto acima do orçamento'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Taxa de Conclusão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Atividades Concluídas</span>
                    <span className="font-bold text-lg text-blue-600">{kpiData.completionRate}%</span>
                  </div>
                  <Progress value={kpiData.completionRate} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {kpiData.completionRate >= 75 ? 'Excelente progresso' : 
                     kpiData.completionRate >= 50 ? 'Bom progresso' : 'Necessita atenção'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Variações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Variação do Cronograma</span>
                    <span className={`font-bold ${kpiData.scheduleVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpiData.scheduleVariance > 0 ? '+' : ''}{kpiData.scheduleVariance}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Variação do Orçamento</span>
                    <span className={`font-bold ${kpiData.budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpiData.budgetVariance > 0 ? '+' : ''}{kpiData.budgetVariance}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Roadmap do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Quarterly Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {roadmapData.roadmapByQuarter.map((quarter) => (
                    <Card key={quarter.quarter} className="text-center">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-lg">{quarter.quarter}</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Atividades</span>
                            <span className="font-bold">{quarter.activities}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Marcos</span>
                            <span className="font-bold text-yellow-600">{quarter.milestones}</span>
                          </div>
                          <Progress value={quarter.completionRate} className="h-2" />
                          <span className="text-xs text-muted-foreground">
                            {quarter.completionRate.toFixed(1)}% concluído
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Milestones */}
                <div>
                  <h4 className="font-semibold text-lg mb-4">Marcos do Projeto</h4>
                  <div className="space-y-3">
                    {roadmapData.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <div className="flex-1">
                          <h5 className="font-semibold">{milestone.name}</h5>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>📅 {milestone.plannedStartDate ? formatDate(milestone.plannedStartDate) : 'Não planejado'}</span>
                            <span>👤 {milestone.responsible || 'Não atribuído'}</span>
                            <span>📊 {milestone.discipline || 'Geral'}</span>
                          </div>
                        </div>
                        <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'}>
                          {milestone.status === 'completed' ? 'Concluído' : 
                           milestone.status === 'in_progress' ? 'Em Andamento' : 'Não Iniciado'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="observations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Observações da Inteligência Artificial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button
                  onClick={generateGeminiObservations}
                  disabled={loadingObservations}
                  className="flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  {loadingObservations ? 'Gerando...' : 'Gerar Observações IA'}
                </Button>
              </div>

              {!geminiObservations ? (
                <div className="text-center py-12">
                  <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Observações IA não geradas
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Clique em "Gerar Observações IA" para obter insights inteligentes sobre o projeto.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Estado das observações: {geminiObservations || 'vazio'}
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Análise Inteligente do Projeto
                    </h4>
                    <p className="text-sm text-blue-600">
                      Gerado por IA baseado nos dados do projeto, KPIs e caminho crítico.
                    </p>
                  </div>
                  
                  <div className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {geminiObservations}
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      onClick={generateGeminiObservations}
                      disabled={loadingObservations}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Brain className="w-4 h-4" />
                      {loadingObservations ? 'Gerando...' : 'Gerar Novamente'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
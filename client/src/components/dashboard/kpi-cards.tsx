import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Folder, TrendingDown, TrendingUp, CheckCircle, Plus, Settings2 } from "lucide-react";
import CustomKPIManager from "./custom-kpi-manager";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface KPICardsProps {
  metrics: {
    totalActivities: number;
    completedActivities: number;
    overallCompletionPercentage: number;
    averageSPI: number;
    averageCPI: number;
    totalPlannedCost: number;
    totalRealCost: number;
  };
  dashboardId: number;
  activities: any[];
  projects: any[];
  visibleFields: string[];
  onKPIUpdate: () => void;
}

export default function KPICards({ metrics, dashboardId, activities, projects, visibleFields, onKPIUpdate }: KPICardsProps) {
  const [isKPIManagerOpen, setIsKPIManagerOpen] = useState(false);
  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'active' || p.status === 'in_progress')?.length || 0;
  const completionRate = metrics.totalActivities > 0 ? ((metrics.completedActivities / metrics.totalActivities) * 100) : 0;
  const totalBudget = projects?.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0) || 0;
  const totalActualCost = projects?.reduce((sum, p) => sum + (parseFloat(p.actualCost) || 0), 0) || 0;
  const budgetVariance = totalBudget > 0 ? (((totalActualCost - totalBudget) / totalBudget) * 100) : 0;

  // Buscar KPIs customizados
  const { data: customKPIs = [] } = useQuery({
    queryKey: ['/api/custom-kpis', dashboardId],
    enabled: !!dashboardId,
  });

  const kpis = [
    {
      id: 'kpi_progress',
      title: "Total de Projetos",
      value: totalProjects,
      icon: Folder,
      trend: `${activeProjects} ativos`,
      trendText: "em execução",
      trendUp: activeProjects > 0,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      id: 'kpi_progress',
      title: "Taxa de Conclusão",
      value: `${completionRate.toFixed(1)}%`,
      icon: CheckCircle,
      trend: `${metrics.completedActivities}/${metrics.totalActivities}`,
      trendText: "atividades concluídas",
      trendUp: completionRate > 50,
      bgColor: completionRate > 75 ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20" : "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
      iconColor: completionRate > 75 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
    },
    {
      id: 'kpi_budget',
      title: "Orçamento Total",
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBudget),
      icon: TrendingUp,
      trend: `${budgetVariance >= 0 ? '+' : ''}${budgetVariance.toFixed(1)}%`,
      trendText: "variação orçamentária",
      trendUp: budgetVariance <= 0,
      bgColor: budgetVariance <= 0 ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20" : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
      iconColor: budgetVariance <= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
    },
    {
      id: 'kpi_performance',
      title: "SPI Médio",
      value: (metrics.averageSPI || 1).toFixed(2),
      icon: TrendingDown,
      trend: metrics.averageSPI >= 1 ? "No prazo" : "Atrasado",
      trendText: "performance cronograma",
      trendUp: metrics.averageSPI >= 1,
      bgColor: metrics.averageSPI >= 1 ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20" : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
      iconColor: metrics.averageSPI >= 1 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
    }
  ];

  // Função para verificar se um KPI deve ser exibido
  const isKPIVisible = (kpiId: string) => {
    return visibleFields.length === 0 || visibleFields.includes(kpiId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">KPIs do Dashboard</h2>
        <Dialog open={isKPIManagerOpen} onOpenChange={setIsKPIManagerOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 hover-lift">
              <Plus className="w-4 h-4" />
              Criar KPI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                Gerenciar KPIs
              </DialogTitle>
            </DialogHeader>
            <CustomKPIManager
              dashboardId={dashboardId}
              activities={activities}
              projects={projects}
              onKPIUpdate={() => {
                setIsKPIManagerOpen(false);
                onKPIUpdate();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPIs Padrão */}
        {kpis.filter(kpi => isKPIVisible(kpi.id)).map((kpi, index) => (
          <Card key={index} className="beachpark-kpi-card group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {kpi.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-sky-500 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {kpi.value}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`w-7 h-7 ${kpi.iconColor}`} />
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    kpi.trendUp 
                      ? 'beachpark-status-completed' 
                      : 'beachpark-status-delayed'
                  }`}>
                    {kpi.trend}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    {kpi.trendText}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* KPIs Customizados */}
        {isKPIVisible('kpi_custom') && customKPIs.map((customKPI: any, index: number) => (
          <Card key={`custom-${index}`} className="beachpark-kpi-card group cursor-pointer border-dashed border-2 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                    {customKPI.name}
                  </p>
                  <p className="text-3xl font-bold text-blue-800 dark:text-blue-200 mt-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-sky-500 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {customKPI.value || 'N/A'}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900/20 dark:to-sky-900/20 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <Settings2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="beachpark-status-in-progress rounded-full text-xs font-medium">
                    Customizado
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {customKPI.description || 'KPI personalizado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

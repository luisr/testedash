import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Folder, TrendingDown, TrendingUp, CheckCircle, Plus, Settings2 } from "lucide-react";
import CustomKPIManager from "./custom-kpi-manager";
import { useState } from "react";

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
  onKPIUpdate: () => void;
}

export default function KPICards({ metrics, dashboardId, activities, projects, onKPIUpdate }: KPICardsProps) {
  const [isKPIManagerOpen, setIsKPIManagerOpen] = useState(false);
  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'active' || p.status === 'in_progress')?.length || 0;
  const completionRate = metrics.totalActivities > 0 ? ((metrics.completedActivities / metrics.totalActivities) * 100) : 0;
  const totalBudget = projects?.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0) || 0;
  const totalActualCost = projects?.reduce((sum, p) => sum + (parseFloat(p.actualCost) || 0), 0) || 0;
  const budgetVariance = totalBudget > 0 ? (((totalActualCost - totalBudget) / totalBudget) * 100) : 0;

  const kpis = [
    {
      title: "Total de Projetos",
      value: totalProjects,
      icon: Folder,
      trend: `${activeProjects} ativos`,
      trendText: "em execução",
      trendUp: activeProjects > 0,
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Taxa de Conclusão",
      value: `${completionRate.toFixed(1)}%`,
      icon: CheckCircle,
      trend: `${metrics.completedActivities}/${metrics.totalActivities}`,
      trendText: "atividades concluídas",
      trendUp: completionRate > 50,
      bgColor: completionRate > 75 ? "bg-green-100 dark:bg-green-900/20" : "bg-yellow-100 dark:bg-yellow-900/20",
      iconColor: completionRate > 75 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
    },
    {
      title: "Orçamento Total",
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBudget),
      icon: TrendingUp,
      trend: `${budgetVariance >= 0 ? '+' : ''}${budgetVariance.toFixed(1)}%`,
      trendText: "variação orçamentária",
      trendUp: budgetVariance <= 0,
      bgColor: budgetVariance <= 0 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20",
      iconColor: budgetVariance <= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
    },
    {
      title: "SPI Médio",
      value: (metrics.averageSPI || 1).toFixed(2),
      icon: TrendingDown,
      trend: metrics.averageSPI >= 1 ? "No prazo" : "Atrasado",
      trendText: "performance cronograma",
      trendUp: metrics.averageSPI >= 1,
      bgColor: metrics.averageSPI >= 1 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20",
      iconColor: metrics.averageSPI >= 1 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
    }
  ];

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
      {kpis.map((kpi, index) => (
        <Card key={index} className="kpi-card hover-lift shadow-elegant group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {kpi.title}
                </p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-primary transition-colors">
                  {kpi.value}
                </p>
              </div>
              <div className={`w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-elegant`}>
                <kpi.icon className={`w-7 h-7 ${kpi.iconColor}`} />
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`status-badge ${
                  kpi.trendUp 
                    ? 'status-completed' 
                    : 'status-delayed'
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
      </div>
    </div>
  );
}

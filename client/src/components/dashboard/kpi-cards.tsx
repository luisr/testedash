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
  const kpis = [
    {
      title: "Projetos Ativos",
      value: metrics.totalActivities,
      icon: Folder,
      trend: "+12%",
      trendText: "vs mês anterior",
      trendUp: true,
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      title: "SPI Médio",
      value: metrics.averageSPI.toFixed(2),
      icon: TrendingDown,
      trend: "-5%",
      trendText: "abaixo do ideal",
      trendUp: false,
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400"
    },
    {
      title: "CPI Médio",
      value: metrics.averageCPI.toFixed(2),
      icon: TrendingUp,
      trend: "+8%",
      trendText: "acima do orçamento",
      trendUp: true,
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Tarefas Concluídas",
      value: metrics.completedActivities,
      icon: CheckCircle,
      trend: `${metrics.overallCompletionPercentage.toFixed(0)}%`,
      trendText: "da meta mensal",
      trendUp: true,
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400"
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

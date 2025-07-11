import { Card, CardContent } from "@/components/ui/card";
import { Folder, TrendingDown, TrendingUp, CheckCircle } from "lucide-react";

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
}

export default function KPICards({ metrics }: KPICardsProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {kpi.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                kpi.trendUp ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {kpi.trend}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                {kpi.trendText}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

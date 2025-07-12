import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Star } from "lucide-react";

interface ActivitySummaryProps {
  activities: any[];
  onManageMilestones?: () => void;
}

export default function ActivitySummary({ activities = [], onManageMilestones }: ActivitySummaryProps) {
  const today = new Date();
  
  const summary = {
    total: activities.length,
    completed: activities.filter(a => a.status === 'completed').length,
    inProgress: activities.filter(a => a.status === 'in_progress').length,
    notStarted: activities.filter(a => a.status === 'not_started').length,
    milestones: activities.filter(a => a.isMilestone).length,
    overdue: activities.filter(a => {
      if (!a.finishDate) return false;
      const finishDate = new Date(a.finishDate);
      return finishDate < today && a.status !== 'completed';
    }).length,
    upcoming: activities.filter(a => {
      if (!a.startDate) return false;
      const startDate = new Date(a.startDate);
      const daysDiff = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7 && daysDiff > 0 && a.status === 'not_started';
    }).length,
    avgProgress: activities.length > 0 ? 
      activities.reduce((sum, a) => sum + (parseFloat(a.completionPercentage) || 0), 0) / activities.length : 0
  };

  const completionRate = summary.total > 0 ? (summary.completed / summary.total) * 100 : 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Header with Milestone Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Resumo das Atividades</h3>
        {onManageMilestones && (
          <Button 
            onClick={onManageMilestones}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Gerenciar Marcos ({summary.milestones})
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Resumo Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-foreground">{summary.total}</div>
          <div className="text-sm text-muted-foreground">Total de atividades</div>
          <Progress value={completionRate} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {completionRate.toFixed(1)}% concluídas
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-green-600">{summary.inProgress}</div>
          <div className="text-sm text-muted-foreground">Atividades ativas</div>
          <div className="text-xs text-muted-foreground">
            Progresso médio: {summary.avgProgress.toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Atrasadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-red-600">{summary.overdue}</div>
          <div className="text-sm text-muted-foreground">Necessitam atenção</div>
          {summary.overdue > 0 && (
            <Badge variant="destructive" className="text-xs">
              Urgente
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Próximas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-amber-600">{summary.upcoming}</div>
          <div className="text-sm text-muted-foreground">Iniciam em 7 dias</div>
          {summary.upcoming > 0 && (
            <Badge variant="secondary" className="text-xs">
              Planejar
            </Badge>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
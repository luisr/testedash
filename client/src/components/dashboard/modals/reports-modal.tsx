import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, FileText, Users, DollarSign, TrendingUp } from "lucide-react";

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: number;
}

export function ReportsModal({ isOpen, onClose, dashboardId }: ReportsModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const reports = [
    {
      id: "projects",
      title: "Relatório de Projetos",
      description: "Visão geral completa de todos os projetos com status, orçamento e progresso",
      icon: BarChart3,
      color: "bg-blue-500",
      badge: "Projetos",
      badgeVariant: "default" as const,
    },
    {
      id: "users",
      title: "Relatório de Usuários",
      description: "Análise detalhada de usuários, funções e atividades no sistema",
      icon: Users,
      color: "bg-green-500",
      badge: "Usuários",
      badgeVariant: "secondary" as const,
    },
    {
      id: "financial",
      title: "Relatório Financeiro",
      description: "Análise de custos, orçamentos e variações financeiras dos projetos",
      icon: DollarSign,
      color: "bg-yellow-500",
      badge: "Financeiro",
      badgeVariant: "outline" as const,
    },
    {
      id: "general",
      title: "Relatório Executivo",
      description: "Resumo executivo com KPIs principais e análises de desempenho geral",
      icon: TrendingUp,
      color: "bg-purple-500",
      badge: "Executivo",
      badgeVariant: "destructive" as const,
    },
  ];

  const handleDownloadReport = async (reportId: string) => {
    setLoading(reportId);
    try {
      const response = await fetch(`/api/reports/${reportId}/pdf?dashboardId=${dashboardId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar relatório');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `relatorio-${reportId}-dashboard-${dashboardId}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios do Sistema
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 h-full">
          <div className="text-sm text-muted-foreground">
            Selecione o tipo de relatório que deseja gerar e baixar.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="beachpark-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${report.color} text-white`}>
                        <report.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <Badge variant={report.badgeVariant} className="mt-1">
                          {report.badge}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {report.description}
                  </p>
                  <Button
                    onClick={() => handleDownloadReport(report.id)}
                    disabled={loading === report.id}
                    className="w-full beachpark-btn-primary"
                  >
                    {loading === report.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar PDF
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">
            <strong>Nota:</strong> Os relatórios são gerados com dados atualizados do Dashboard {dashboardId} e incluem 
            análises inteligentes baseadas em IA para fornecer insights valiosos sobre o desempenho dos projetos.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
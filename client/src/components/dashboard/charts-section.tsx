import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MoreHorizontal, Plus, BarChart3, Settings2 } from "lucide-react";
import CustomChartBuilder from "./custom-chart-builder";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { useQuery } from "@tanstack/react-query";

interface ChartsSectionProps {
  metrics: {
    statusDistribution: { name: string; value: number; color: string }[];
    monthlyProgress: { month: string; planned: number; actual: number }[];
    disciplineProgress: { discipline: string; completion: number }[];
  };
  customCharts: any[];
  dashboardId: number;
  activities: any[];
  projects: any[];
  visibleFields: string[];
  onChartsUpdate: () => void;
}

export default function ChartsSection({ metrics, customCharts, dashboardId, activities, projects, visibleFields, onChartsUpdate }: ChartsSectionProps) {
  const [isChartBuilderOpen, setIsChartBuilderOpen] = useState(false);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Buscar gráficos customizados
  const { data: customChartsData = [] } = useQuery({
    queryKey: ['/api/custom-charts', dashboardId],
    enabled: !!dashboardId,
  });

  const statusData = [
    { name: 'Concluído', value: 35, color: '#10B981' },
    { name: 'Em Andamento', value: 40, color: '#3B82F6' },
    { name: 'Atrasado', value: 15, color: '#F59E0B' },
    { name: 'Não Iniciado', value: 10, color: '#64748B' }
  ];

  const progressData = [
    { month: 'Jan', planned: 10, actual: 8 },
    { month: 'Fev', planned: 25, actual: 20 },
    { month: 'Mar', planned: 40, actual: 35 },
    { month: 'Abr', planned: 55, actual: 45 },
    { month: 'Mai', planned: 70, actual: 60 },
    { month: 'Jun', planned: 85, actual: 72 }
  ];

  // Função para verificar se um gráfico deve ser exibido
  const isChartVisible = (chartId: string) => {
    return visibleFields.length === 0 || visibleFields.includes(chartId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Gráficos e Análises</h2>
        <Dialog open={isChartBuilderOpen} onOpenChange={setIsChartBuilderOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Criar Gráfico
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Construtor de Gráficos
              </DialogTitle>
            </DialogHeader>
            <CustomChartBuilder
              dashboardId={dashboardId}
              activities={activities}
              projects={projects}
              onChartCreate={(chart) => {
                setIsChartBuilderOpen(false);
                onChartsUpdate();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Status dos Projetos */}
        {isChartVisible('chart_status') && (
          <Card className="chart-container shadow-elegant hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">
                Status dos Projetos
              </CardTitle>
              <Button variant="ghost" size="icon" className="hover-lift focus-ring">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Progresso Mensal */}
        {isChartVisible('chart_progress') && (
          <Card className="chart-container shadow-elegant hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">
                Progresso Mensal
              </CardTitle>
              <Button variant="ghost" size="icon" className="hover-lift focus-ring">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="planned" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="Planejado"
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="hsl(var(--status-completed))" 
                      strokeWidth={3}
                      name="Real"
                      dot={{ fill: 'hsl(var(--status-completed))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráficos Customizados */}
      {isChartVisible('chart_custom') && customChartsData.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Gráficos Customizados</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {customChartsData.map((chart: any, index: number) => (
              <Card key={`custom-chart-${index}`} className="chart-container shadow-elegant hover-lift border-dashed border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                    <Settings2 className="w-5 h-5" />
                    {chart.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Customizado
                    </span>
                    <Button variant="ghost" size="icon" className="hover-lift focus-ring">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      {chart.type === 'bar' ? (
                        <BarChart data={chart.data || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Bar 
                            dataKey="value" 
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      ) : chart.type === 'line' ? (
                        <LineChart data={chart.data || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={3}
                            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      ) : (
                        <PieChart>
                          <Pie
                            data={chart.data || []}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {(chart.data || []).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                  {chart.description && (
                    <p className="text-sm text-blue-600 mt-2 italic">
                      {chart.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

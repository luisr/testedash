import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ChartsSectionProps {
  metrics: {
    statusDistribution: { name: string; value: number; color: string }[];
    monthlyProgress: { month: string; planned: number; actual: number }[];
    disciplineProgress: { discipline: string; completion: number }[];
  };
  customCharts: any[];
}

export default function ChartsSection({ metrics, customCharts }: ChartsSectionProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Status dos Projetos
          </CardTitle>
          <Button variant="ghost" size="icon">
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Progresso Mensal
          </CardTitle>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="planned" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Planejado"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Real"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

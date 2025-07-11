import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp,
  Plus, 
  Edit2, 
  Trash2,
  Eye,
  Settings,
  Database
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface CustomChart {
  id: string;
  name: string;
  description?: string;
  type: 'bar' | 'pie' | 'line' | 'area';
  dataSource: 'activities' | 'projects' | 'custom';
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max';
  colors: string[];
  filters: ChartFilter[];
  isActive: boolean;
  order: number;
  width: 'full' | 'half' | 'third';
}

interface ChartFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between';
  value: string;
}

interface ChartBuilderProps {
  dashboardId: number;
  activities: any[];
  projects: any[];
  onChartsUpdate: (charts: CustomChart[]) => void;
}

const chartTypes = [
  { value: 'bar', label: 'Gráfico de Barras', icon: BarChart3 },
  { value: 'pie', label: 'Gráfico de Pizza', icon: PieChart },
  { value: 'line', label: 'Gráfico de Linha', icon: LineChart },
  { value: 'area', label: 'Gráfico de Área', icon: TrendingUp }
];

const dataSourceOptions = [
  { value: 'activities', label: 'Atividades' },
  { value: 'projects', label: 'Projetos' }
];

const aggregationOptions = [
  { value: 'count', label: 'Contagem' },
  { value: 'sum', label: 'Soma' },
  { value: 'avg', label: 'Média' },
  { value: 'min', label: 'Mínimo' },
  { value: 'max', label: 'Máximo' }
];

const defaultColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
];

export default function CustomChartBuilder({ dashboardId, activities, projects, onChartsUpdate }: ChartBuilderProps) {
  const [charts, setCharts] = useState<CustomChart[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingChart, setEditingChart] = useState<CustomChart | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const { toast } = useToast();

  const [newChart, setNewChart] = useState<Partial<CustomChart>>({
    name: '',
    description: '',
    type: 'bar',
    dataSource: 'activities',
    xAxis: 'status',
    yAxis: 'count',
    aggregation: 'count',
    colors: defaultColors,
    filters: [],
    isActive: true,
    width: 'half'
  });

  useEffect(() => {
    loadCustomCharts();
  }, [dashboardId]);

  useEffect(() => {
    if (newChart.dataSource && newChart.xAxis && newChart.yAxis) {
      generatePreviewData();
    }
  }, [newChart.dataSource, newChart.xAxis, newChart.yAxis, newChart.aggregation]);

  const loadCustomCharts = async () => {
    try {
      const response = await fetch(`/api/custom-charts/${dashboardId}`);
      if (response.ok) {
        const data = await response.json();
        setCharts(data);
      }
    } catch (error) {
      console.error('Error loading custom charts:', error);
    }
  };

  const saveChart = async (chart: CustomChart) => {
    try {
      const response = await fetch(`/api/custom-charts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...chart, dashboardId })
      });

      if (response.ok) {
        await loadCustomCharts();
        toast({
          title: "Sucesso",
          description: "Gráfico salvo com sucesso"
        });
      }
    } catch (error) {
      console.error('Error saving chart:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar gráfico",
        variant: "destructive"
      });
    }
  };

  const generatePreviewData = () => {
    const dataSource = newChart.dataSource === 'activities' ? activities : projects;
    const xField = newChart.xAxis;
    const yField = newChart.yAxis;
    const aggregation = newChart.aggregation;

    if (!dataSource || !xField) return;

    const grouped = dataSource.reduce((acc, item) => {
      const key = item[xField] || 'Sem valor';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    const chartData = Object.entries(grouped).map(([key, items]) => {
      let value = 0;
      
      switch (aggregation) {
        case 'count':
          value = items.length;
          break;
        case 'sum':
          value = items.reduce((sum, item) => sum + (parseFloat(item[yField]) || 0), 0);
          break;
        case 'avg':
          value = items.reduce((sum, item) => sum + (parseFloat(item[yField]) || 0), 0) / items.length;
          break;
        case 'min':
          value = Math.min(...items.map(item => parseFloat(item[yField]) || 0));
          break;
        case 'max':
          value = Math.max(...items.map(item => parseFloat(item[yField]) || 0));
          break;
      }

      return {
        name: key,
        value: isNaN(value) ? 0 : value
      };
    });

    setPreviewData(chartData);
  };

  const createChart = async () => {
    if (!newChart.name || !newChart.xAxis) {
      toast({
        title: "Erro",
        description: "Nome e campo X são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const chart: CustomChart = {
      id: `chart_${Date.now()}`,
      name: newChart.name!,
      description: newChart.description,
      type: newChart.type!,
      dataSource: newChart.dataSource!,
      xAxis: newChart.xAxis!,
      yAxis: newChart.yAxis!,
      aggregation: newChart.aggregation!,
      colors: newChart.colors || defaultColors,
      filters: newChart.filters || [],
      isActive: true,
      order: charts.length + 1,
      width: newChart.width || 'half'
    };

    await saveChart(chart);
    
    setNewChart({
      name: '',
      description: '',
      type: 'bar',
      dataSource: 'activities',
      xAxis: 'status',
      yAxis: 'count',
      aggregation: 'count',
      colors: defaultColors,
      filters: [],
      isActive: true,
      width: 'half'
    });
    setShowCreateDialog(false);
  };

  const deleteChart = async (chartId: string) => {
    try {
      const response = await fetch(`/api/custom-charts/${chartId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadCustomCharts();
        toast({
          title: "Sucesso",
          description: "Gráfico excluído com sucesso"
        });
      }
    } catch (error) {
      console.error('Error deleting chart:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir gráfico",
        variant: "destructive"
      });
    }
  };

  const getFieldOptions = (dataSource: string) => {
    const source = dataSource === 'activities' ? activities : projects;
    if (!source || source.length === 0) return [];

    const fields = Object.keys(source[0] || {});
    return fields.map(field => ({
      value: field,
      label: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  };

  const renderPreviewChart = () => {
    if (!previewData || previewData.length === 0) return null;

    const chartProps = {
      data: previewData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (newChart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Tooltip />
              <RechartsPieChart dataKey="value" data={previewData} cx="50%" cy="50%" outerRadius={60}>
                {previewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
                ))}
              </RechartsPieChart>
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RechartsLineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" />
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Database className="w-5 h-5" />
          Gráficos Personalizados
        </h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Gráfico
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {charts.map(chart => (
          <Card key={chart.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{chart.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingChart(chart);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteChart(chart.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Badge variant="outline">{chart.type}</Badge>
                  <Badge variant="outline">{chart.dataSource}</Badge>
                  <Badge variant="outline">{chart.aggregation}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {chart.description}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Eixos:</span> {chart.xAxis} × {chart.yAxis}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Chart Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Gráfico</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config">Configuração</TabsTrigger>
              <TabsTrigger value="preview">Visualização</TabsTrigger>
            </TabsList>
            
            <TabsContent value="config" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chart-name">Nome do Gráfico</Label>
                  <Input
                    id="chart-name"
                    value={newChart.name}
                    onChange={(e) => setNewChart(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Atividades por Status"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chart-type">Tipo de Gráfico</Label>
                  <Select value={newChart.type} onValueChange={(value) => setNewChart(prev => ({ ...prev, type: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {chartTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data-source">Fonte de Dados</Label>
                  <Select value={newChart.dataSource} onValueChange={(value) => setNewChart(prev => ({ ...prev, dataSource: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSourceOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aggregation">Agregação</Label>
                  <Select value={newChart.aggregation} onValueChange={(value) => setNewChart(prev => ({ ...prev, aggregation: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aggregationOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="x-axis">Eixo X (Categoria)</Label>
                  <Select value={newChart.xAxis} onValueChange={(value) => setNewChart(prev => ({ ...prev, xAxis: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getFieldOptions(newChart.dataSource!).map(field => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="y-axis">Eixo Y (Valor)</Label>
                  <Select value={newChart.yAxis} onValueChange={(value) => setNewChart(prev => ({ ...prev, yAxis: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getFieldOptions(newChart.dataSource!).map(field => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={newChart.description}
                  onChange={(e) => setNewChart(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o propósito deste gráfico"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-4">Visualização do Gráfico</h4>
                {renderPreviewChart()}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createChart}>
              Criar Gráfico
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
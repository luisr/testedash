import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Users, 
  Calendar, 
  Target, 
  Clock,
  Plus, 
  Edit2, 
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';

interface CustomKPI {
  id: number;
  name: string;
  description?: string;
  dataSource: 'activities' | 'projects' | 'custom';
  field: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'percentage';
  filters: KPIFilter[];
  icon: string;
  color: string;
  format: 'number' | 'currency' | 'percentage' | 'days';
  target?: number;
  targetComparison: 'gt' | 'lt' | 'eq';
  isActive: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
}

interface KPIFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between';
  value: string;
}

interface KPIManagerProps {
  dashboardId: number;
  activities: any[];
  projects: any[]; // Mantido para compatibilidade mas não utilizado
  onKPIsUpdate: (kpis: CustomKPI[]) => void;
}

const iconOptions = [
  { value: 'TrendingUp', label: 'Tendência Crescente', icon: TrendingUp },
  { value: 'TrendingDown', label: 'Tendência Decrescente', icon: TrendingDown },
  { value: 'Activity', label: 'Atividade', icon: Activity },
  { value: 'DollarSign', label: 'Dinheiro', icon: DollarSign },
  { value: 'Users', label: 'Usuários', icon: Users },
  { value: 'Calendar', label: 'Calendário', icon: Calendar },
  { value: 'Target', label: 'Alvo', icon: Target },
  { value: 'Clock', label: 'Relógio', icon: Clock },
  { value: 'BarChart3', label: 'Gráfico', icon: BarChart3 }
];

const colorOptions = [
  { value: '#3B82F6', label: 'Azul', color: '#3B82F6' },
  { value: '#10B981', label: 'Verde', color: '#10B981' },
  { value: '#F59E0B', label: 'Amarelo', color: '#F59E0B' },
  { value: '#EF4444', label: 'Vermelho', color: '#EF4444' },
  { value: '#8B5CF6', label: 'Roxo', color: '#8B5CF6' },
  { value: '#06B6D4', label: 'Ciano', color: '#06B6D4' },
  { value: '#84CC16', label: 'Lima', color: '#84CC16' },
  { value: '#F97316', label: 'Laranja', color: '#F97316' }
];

const aggregationOptions = [
  { value: 'count', label: 'Contagem' },
  { value: 'sum', label: 'Soma' },
  { value: 'avg', label: 'Média' },
  { value: 'min', label: 'Mínimo' },
  { value: 'max', label: 'Máximo' },
  { value: 'percentage', label: 'Porcentagem' }
];

const formatOptions = [
  { value: 'number', label: 'Número' },
  { value: 'currency', label: 'Moeda' },
  { value: 'percentage', label: 'Porcentagem' },
  { value: 'days', label: 'Dias' }
];

export default function CustomKPIManager({ dashboardId, activities, projects, onKPIsUpdate }: KPIManagerProps) {
  const [kpis, setKpis] = useState<CustomKPI[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingKPI, setEditingKPI] = useState<CustomKPI | null>(null);
  const [previewValue, setPreviewValue] = useState<number | null>(null);
  const { toast } = useToast();

  const [newKPI, setNewKPI] = useState<Partial<CustomKPI>>({
    name: '',
    description: '',
    dataSource: 'activities', // Fixo em activities - única fonte de dados
    field: 'status',
    aggregation: 'count',
    filters: [],
    icon: 'TrendingUp',
    color: '#3B82F6',
    format: 'number',
    targetComparison: 'gt',
    isActive: true,
    size: 'medium'
  });

  useEffect(() => {
    loadCustomKPIs();
  }, [dashboardId]);

  useEffect(() => {
    if (newKPI.dataSource && newKPI.field && newKPI.aggregation) {
      calculatePreviewValue();
    }
  }, [newKPI.dataSource, newKPI.field, newKPI.aggregation, newKPI.filters]);

  const loadCustomKPIs = async () => {
    try {
      const response = await fetch(`/api/custom-kpis/${dashboardId}`);
      if (response.ok) {
        const data = await response.json();
        setKpis(data);
      }
    } catch (error) {
      console.error('Error loading custom KPIs:', error);
    }
  };

  const calculatePreviewValue = () => {
    // Sempre usar activities como fonte de dados
    const dataSource = activities;
    const field = newKPI.field;
    const aggregation = newKPI.aggregation;

    if (!dataSource || !field || !aggregation) return;

    // Apply filters
    let filteredData = dataSource;
    if (newKPI.filters && newKPI.filters.length > 0) {
      filteredData = dataSource.filter(item => {
        return newKPI.filters!.every(filter => {
          const itemValue = item[filter.field];
          const filterValue = filter.value;
          
          switch (filter.operator) {
            case 'equals':
              return itemValue === filterValue;
            case 'contains':
              return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
            case 'gt':
              return parseFloat(itemValue) > parseFloat(filterValue);
            case 'lt':
              return parseFloat(itemValue) < parseFloat(filterValue);
            default:
              return true;
          }
        });
      });
    }

    let value = 0;
    
    switch (aggregation) {
      case 'count':
        value = filteredData.length;
        break;
      case 'sum':
        if (field === 'completionPercentage' || field === 'plannedBudget' || field === 'actualBudget') {
          value = filteredData.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0);
        } else {
          value = filteredData.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0);
        }
        break;
      case 'avg':
        const sum = filteredData.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0);
        value = filteredData.length > 0 ? sum / filteredData.length : 0;
        break;
      case 'min':
        value = Math.min(...filteredData.map(item => parseFloat(item[field]) || 0));
        break;
      case 'max':
        value = Math.max(...filteredData.map(item => parseFloat(item[field]) || 0));
        break;
      case 'percentage':
        // Para porcentagem, calcular ratio específico baseado no campo
        if (field === 'status') {
          // Porcentagem de tarefas com status específico
          value = activities.length > 0 ? (filteredData.length / activities.length) * 100 : 0;
        } else if (field === 'completionPercentage') {
          // Média de progresso
          const totalProgress = filteredData.reduce((sum, item) => sum + (parseFloat(item.completionPercentage) || 0), 0);
          value = filteredData.length > 0 ? totalProgress / filteredData.length : 0;
        } else {
          value = activities.length > 0 ? (filteredData.length / activities.length) * 100 : 0;
        }
        break;
    }

    setPreviewValue(isNaN(value) ? 0 : value);
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'days':
        return `${value.toFixed(0)} dias`;
      default:
        return value.toFixed(0);
    }
  };

  const saveKPI = async (kpi: Omit<CustomKPI, 'id'>) => {
    try {
      const response = await fetch(`/api/custom-kpis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...kpi, dashboardId })
      });

      if (response.ok) {
        await loadCustomKPIs();
        toast({
          title: "Sucesso",
          description: "KPI salvo com sucesso"
        });
      }
    } catch (error) {
      console.error('Error saving KPI:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar KPI",
        variant: "destructive"
      });
    }
  };

  const createKPI = async () => {
    if (!newKPI.name || !newKPI.field) {
      toast({
        title: "Erro",
        description: "Nome e campo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const kpi: Omit<CustomKPI, 'id'> = {
      name: newKPI.name!,
      description: newKPI.description,
      dataSource: newKPI.dataSource!,
      field: newKPI.field!,
      aggregation: newKPI.aggregation!,
      filters: newKPI.filters || [],
      icon: newKPI.icon!,
      color: newKPI.color!,
      format: newKPI.format!,
      target: newKPI.target,
      targetComparison: newKPI.targetComparison!,
      isActive: true,
      order: kpis.length + 1,
      size: newKPI.size!
    };

    await saveKPI(kpi);
    
    setNewKPI({
      name: '',
      description: '',
      dataSource: 'activities', // Fixo em activities
      field: 'status',
      aggregation: 'count',
      filters: [],
      icon: 'TrendingUp',
      color: '#3B82F6',
      format: 'number',
      targetComparison: 'gt',
      isActive: true,
      size: 'medium'
    });
    setShowCreateDialog(false);
  };

  const deleteKPI = async (kpiId: number) => {
    try {
      const response = await fetch(`/api/custom-kpis/${kpiId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadCustomKPIs();
        toast({
          title: "Sucesso",
          description: "KPI excluído com sucesso"
        });
      }
    } catch (error) {
      console.error('Error deleting KPI:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir KPI",
        variant: "destructive"
      });
    }
  };

  const getFieldOptions = () => {
    // Sempre usar activities como fonte de dados
    const source = activities;
    if (!source || source.length === 0) return [];

    // Campos específicos das atividades que fazem sentido para KPIs
    const allowedFields = [
      'status', 'priority', 'completionPercentage', 'plannedBudget', 'actualBudget',
      'responsible', 'discipline', 'plannedStartDate', 'plannedEndDate', 'actualStartDate', 'actualEndDate'
    ];

    const fields = Object.keys(source[0] || {}).filter(field => allowedFields.includes(field));
    return fields.map(field => ({
      value: field,
      label: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : TrendingUp;
  };

  const addFilter = () => {
    setNewKPI(prev => ({
      ...prev,
      filters: [...(prev.filters || []), { field: '', operator: 'equals', value: '' }]
    }));
  };

  const removeFilter = (index: number) => {
    setNewKPI(prev => ({
      ...prev,
      filters: prev.filters?.filter((_, i) => i !== index) || []
    }));
  };

  const updateFilter = (index: number, field: keyof KPIFilter, value: string) => {
    setNewKPI(prev => ({
      ...prev,
      filters: prev.filters?.map((filter, i) => 
        i === index ? { ...filter, [field]: value } : filter
      ) || []
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          KPIs Personalizados
        </h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo KPI
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(kpi => {
          const IconComponent = getIconComponent(kpi.icon);
          const calculatedValue = 100; // TODO: Calculate actual value
          const formattedValue = formatValue(calculatedValue, kpi.format);
          const isTargetMet = kpi.target ? 
            (kpi.targetComparison === 'gt' ? calculatedValue > kpi.target :
             kpi.targetComparison === 'lt' ? calculatedValue < kpi.target :
             calculatedValue === kpi.target) : true;

          return (
            <Card key={kpi.id} className={`${kpi.size === 'large' ? 'col-span-2' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${kpi.color}20` }}
                    >
                      <IconComponent className="w-5 h-5" style={{ color: kpi.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{kpi.name}</CardTitle>
                      {kpi.description && (
                        <p className="text-xs text-muted-foreground">{kpi.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingKPI(kpi);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteKPI(kpi.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold" style={{ color: kpi.color }}>
                    {formattedValue}
                  </div>
                  {kpi.target && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Meta:</span>
                      <span>{formatValue(kpi.target, kpi.format)}</span>
                      <Badge variant={isTargetMet ? "default" : "secondary"}>
                        {isTargetMet ? "Atingida" : "Não atingida"}
                      </Badge>
                    </div>
                  )}
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">{kpi.dataSource}</Badge>
                    <Badge variant="outline">{kpi.aggregation}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create KPI Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo KPI</DialogTitle>
            <DialogDescription>
              Configure um novo KPI personalizado para seu dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kpi-name">Nome do KPI</Label>
                <Input
                  id="kpi-name"
                  value={newKPI.name}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Taxa de Conclusão"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Fonte de Dados</Label>
                <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Atividades</span>
                  <Badge variant="secondary" className="ml-auto">Fonte única</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="field">Campo</Label>
                <Select value={newKPI.field} onValueChange={(value) => setNewKPI(prev => ({ ...prev, field: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getFieldOptions().map(field => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aggregation">Agregação</Label>
                <Select value={newKPI.aggregation} onValueChange={(value) => setNewKPI(prev => ({ ...prev, aggregation: value as any }))}>
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
                <Label htmlFor="icon">Ícone</Label>
                <Select value={newKPI.icon} onValueChange={(value) => setNewKPI(prev => ({ ...prev, icon: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(option => {
                      const IconComponent = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Select value={newKPI.color} onValueChange={(value) => setNewKPI(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: option.color }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="format">Formato</Label>
                <Select value={newKPI.format} onValueChange={(value) => setNewKPI(prev => ({ ...prev, format: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target">Meta (Opcional)</Label>
                <Input
                  id="target"
                  type="number"
                  value={newKPI.target || ''}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, target: parseFloat(e.target.value) || undefined }))}
                  placeholder="Ex: 100"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={newKPI.description}
                onChange={(e) => setNewKPI(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o que este KPI mede"
              />
            </div>
            
            {/* Filters */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Filtros</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFilter}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Filtro
                </Button>
              </div>
              
              {newKPI.filters?.map((filter, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Select value={filter.field} onValueChange={(value) => updateFilter(index, 'field', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFieldOptions(newKPI.dataSource!).map(field => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filter.operator} onValueChange={(value) => updateFilter(index, 'operator', value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Igual</SelectItem>
                      <SelectItem value="contains">Contém</SelectItem>
                      <SelectItem value="gt">Maior que</SelectItem>
                      <SelectItem value="lt">Menor que</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    value={filter.value}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    placeholder="Valor"
                    className="flex-1"
                  />
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Preview */}
            {previewValue !== null && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm mb-2">Preview do KPI:</div>
                <div className="text-2xl font-bold" style={{ color: newKPI.color }}>
                  {formatValue(previewValue, newKPI.format!)}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createKPI}>
              Criar KPI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
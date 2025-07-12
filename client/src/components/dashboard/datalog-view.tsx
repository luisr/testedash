import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity } from '@shared/schema';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  FileText
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface DatalogViewProps {
  activities: Activity[];
  projects: any[];
}

const statusColors = {
  'not_started': 'bg-gray-100 text-gray-800',
  'in_progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'delayed': 'bg-orange-100 text-orange-800',
  'cancelled': 'bg-red-100 text-red-800'
};

const statusLabels = {
  'not_started': 'Não Iniciado',
  'in_progress': 'Em Andamento',
  'completed': 'Concluído',
  'delayed': 'Atrasado',
  'cancelled': 'Cancelado'
};

const priorityColors = {
  'low': 'bg-green-100 text-green-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-orange-100 text-orange-800',
  'critical': 'bg-red-100 text-red-800'
};

const priorityLabels = {
  'low': 'Baixa',
  'medium': 'Média',
  'high': 'Alta',
  'critical': 'Crítica'
};

export default function DatalogView({ activities, projects }: DatalogViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities.filter(activity => {
      const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.responsible?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filterStatus || activity.status === filterStatus;
      const matchesPriority = !filterPriority || activity.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort activities
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'completion':
          aValue = a.completionPercentage || 0;
          bValue = b.completionPercentage || 0;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [activities, searchTerm, filterStatus, filterPriority, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Datalog do Projeto</h2>
          <p className="text-muted-foreground">Visualização detalhada de todas as atividades</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {filteredAndSortedActivities.length} atividades
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar atividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Todos os Status</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Todas as Prioridades</option>
              {Object.entries(priorityLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="date">Data</option>
              <option value="name">Nome</option>
              <option value="status">Status</option>
              <option value="priority">Prioridade</option>
              <option value="completion">Progresso</option>
            </select>

            <Button 
              variant="outline" 
              onClick={() => toggleSort(sortBy)}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredAndSortedActivities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {activity.isMilestone && (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    )}
                    <h3 className="text-lg font-semibold text-foreground">{activity.name}</h3>
                    <Badge className={statusColors[activity.status as keyof typeof statusColors]}>
                      {statusLabels[activity.status as keyof typeof statusLabels]}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[activity.priority as keyof typeof priorityColors]}>
                      {priorityLabels[activity.priority as keyof typeof priorityLabels]}
                    </Badge>
                  </div>
                  
                  {activity.description && (
                    <p className="text-muted-foreground mb-4">{activity.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{activity.responsible || 'Não definido'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {activity.plannedStartDate ? formatDate(activity.plannedStartDate) : 'Não definido'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {activity.plannedFinishDate ? formatDate(activity.plannedFinishDate) : 'Não definido'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{activity.completionPercentage || 0}% concluído</span>
                    </div>
                  </div>
                  
                  {(activity.plannedCost || activity.actualCost) && (
                    <div className="mt-4 flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Custo Planejado: </span>
                        <span className="font-medium">{formatCurrency(activity.plannedCost || 0)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Custo Real: </span>
                        <span className="font-medium">{formatCurrency(activity.actualCost || 0)}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {activity.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {activity.status === 'delayed' && (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                  {activity.isMilestone && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Marco
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedActivities.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma atividade encontrada</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros ou criar uma nova atividade.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
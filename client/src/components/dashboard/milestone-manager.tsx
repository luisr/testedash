import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity } from '@shared/schema';
import { 
  Star, 
  Search, 
  Calendar, 
  User, 
  Target,
  CheckCircle,
  AlertTriangle,
  Filter
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface MilestoneManagerProps {
  open: boolean;
  onClose: () => void;
  activities: Activity[];
  dashboardId: number;
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

export default function MilestoneManager({ open, onClose, activities, dashboardId }: MilestoneManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || activity.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const currentMilestones = activities.filter(activity => activity.isMilestone);
  const nonMilestones = filteredActivities.filter(activity => !activity.isMilestone);

  const updateMilestone = useMutation({
    mutationFn: async ({ activityId, isMilestone }: { activityId: number; isMilestone: boolean }) => {
      return await apiRequest('PUT', `/api/activities/${activityId}`, {
        isMilestone
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities', 'dashboard', dashboardId] });
      toast({
        title: "Marco atualizado",
        description: "O status de marco da atividade foi atualizado com sucesso.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar marco:', error);
      toast({
        title: "Erro ao atualizar marco",
        description: "Não foi possível atualizar o status de marco da atividade.",
        variant: "destructive"
      });
    }
  });

  const bulkUpdateMilestones = useMutation({
    mutationFn: async ({ activityIds, isMilestone }: { activityIds: number[]; isMilestone: boolean }) => {
      const promises = activityIds.map(id => 
        apiRequest('PUT', `/api/activities/${id}`, { isMilestone })
      );
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities', 'dashboard', dashboardId] });
      setSelectedActivities(new Set());
      toast({
        title: "Marcos atualizados",
        description: "Os marcos foram atualizados com sucesso.",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar marcos:', error);
      toast({
        title: "Erro ao atualizar marcos",
        description: "Não foi possível atualizar os marcos selecionados.",
        variant: "destructive"
      });
    }
  });

  const handleActivityToggle = (activityId: number) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activityId)) {
      newSelected.delete(activityId);
    } else {
      newSelected.add(activityId);
    }
    setSelectedActivities(newSelected);
  };

  const handleToggleMilestone = (activityId: number, currentStatus: boolean) => {
    updateMilestone.mutate({ activityId, isMilestone: !currentStatus });
  };

  const handleBulkAction = (isMilestone: boolean) => {
    if (selectedActivities.size === 0) {
      toast({
        title: "Nenhuma atividade selecionada",
        description: "Selecione pelo menos uma atividade para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    bulkUpdateMilestones.mutate({ 
      activityIds: Array.from(selectedActivities), 
      isMilestone 
    });
  };

  const selectAll = () => {
    setSelectedActivities(new Set(nonMilestones.map(a => a.id)));
  };

  const clearSelection = () => {
    setSelectedActivities(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Gerenciar Marcos do Projeto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Milestones */}
          {currentMilestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  Marcos Atuais ({currentMilestones.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentMilestones.map(milestone => (
                    <div key={milestone.id} className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <h4 className="font-semibold text-foreground">{milestone.name}</h4>
                            <Badge className={statusColors[milestone.status as keyof typeof statusColors]}>
                              {statusLabels[milestone.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {milestone.plannedStartDate ? formatDate(milestone.plannedStartDate) : 'Não definido'}
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3" />
                              {milestone.responsible || 'Não definido'}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleMilestone(milestone.id, true)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remover Marco
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
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
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {nonMilestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Atividades Disponíveis ({nonMilestones.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      Selecionar Todos
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Limpar Seleção
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handleBulkAction(true)}
                      disabled={selectedActivities.size === 0 || bulkUpdateMilestones.isPending}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Marcar como Marcos ({selectedActivities.size})
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nonMilestones.map(activity => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <Checkbox
                        checked={selectedActivities.has(activity.id)}
                        onCheckedChange={() => handleActivityToggle(activity.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{activity.name}</h4>
                          <Badge className={statusColors[activity.status as keyof typeof statusColors]}>
                            {statusLabels[activity.status as keyof typeof statusLabels]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {activity.plannedStartDate ? formatDate(activity.plannedStartDate) : 'Não definido'}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {activity.responsible || 'Não definido'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {activity.completionPercentage || 0}% concluído
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleMilestone(activity.id, false)}
                        className="flex items-center gap-2"
                      >
                        <Star className="w-4 h-4" />
                        Marcar como Marco
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {nonMilestones.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma atividade encontrada</h3>
                <p className="text-muted-foreground">Ajuste os filtros ou crie novas atividades.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
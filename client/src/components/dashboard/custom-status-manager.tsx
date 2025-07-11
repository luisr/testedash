import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Palette, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  Settings 
} from 'lucide-react';

interface CustomStatus {
  id: string;
  name: string;
  label: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  isDefault: boolean;
  isActive: boolean;
  order: number;
  description?: string;
}

interface CustomStatusManagerProps {
  dashboardId: number;
  onStatusUpdate: (statuses: CustomStatus[]) => void;
}

const defaultStatuses: CustomStatus[] = [
  {
    id: 'not_started',
    name: 'not_started',
    label: 'Não Iniciado',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    isDefault: true,
    isActive: true,
    order: 1
  },
  {
    id: 'in_progress',
    name: 'in_progress',
    label: 'Em Andamento',
    color: '#3B82F6',
    backgroundColor: '#EBF2FF',
    borderColor: '#93C5FD',
    isDefault: true,
    isActive: true,
    order: 2
  },
  {
    id: 'completed',
    name: 'completed',
    label: 'Concluído',
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    isDefault: true,
    isActive: true,
    order: 3
  },
  {
    id: 'delayed',
    name: 'delayed',
    label: 'Atrasado',
    color: '#F59E0B',
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    isDefault: true,
    isActive: true,
    order: 4
  },
  {
    id: 'cancelled',
    name: 'cancelled',
    label: 'Cancelado',
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    isDefault: true,
    isActive: true,
    order: 5
  }
];

export default function CustomStatusManager({ dashboardId, onStatusUpdate }: CustomStatusManagerProps) {
  const [statuses, setStatuses] = useState<CustomStatus[]>(defaultStatuses);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingStatus, setEditingStatus] = useState<CustomStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [newStatus, setNewStatus] = useState({
    name: '',
    label: '',
    color: '#3B82F6',
    backgroundColor: '#EBF2FF',
    borderColor: '#93C5FD',
    description: ''
  });

  useEffect(() => {
    loadCustomStatuses();
  }, [dashboardId]);

  const loadCustomStatuses = async () => {
    try {
      const response = await fetch(`/api/custom-statuses/${dashboardId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setStatuses(data);
        }
      }
    } catch (error) {
      console.error('Error loading custom statuses:', error);
    }
  };

  const saveCustomStatuses = async (statusList: CustomStatus[]) => {
    try {
      const response = await fetch(`/api/custom-statuses/${dashboardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusList)
      });

      if (response.ok) {
        setStatuses(statusList);
        onStatusUpdate(statusList);
        toast({
          title: "Sucesso",
          description: "Status personalizados salvos com sucesso"
        });
      }
    } catch (error) {
      console.error('Error saving custom statuses:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar status personalizados",
        variant: "destructive"
      });
    }
  };

  const createStatus = async () => {
    if (!newStatus.name || !newStatus.label) {
      toast({
        title: "Erro",
        description: "Nome e rótulo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const statusId = newStatus.name.toLowerCase().replace(/\s+/g, '_');
    
    if (statuses.find(s => s.id === statusId)) {
      toast({
        title: "Erro",
        description: "Já existe um status com este nome",
        variant: "destructive"
      });
      return;
    }

    const customStatus: CustomStatus = {
      id: statusId,
      name: statusId,
      label: newStatus.label,
      color: newStatus.color,
      backgroundColor: newStatus.backgroundColor,
      borderColor: newStatus.borderColor,
      isDefault: false,
      isActive: true,
      order: statuses.length + 1,
      description: newStatus.description
    };

    const updatedStatuses = [...statuses, customStatus];
    await saveCustomStatuses(updatedStatuses);
    
    setNewStatus({
      name: '',
      label: '',
      color: '#3B82F6',
      backgroundColor: '#EBF2FF',
      borderColor: '#93C5FD',
      description: ''
    });
    setShowCreateDialog(false);
  };

  const updateStatus = async () => {
    if (!editingStatus) return;

    const updatedStatuses = statuses.map(s => 
      s.id === editingStatus.id ? editingStatus : s
    );
    
    await saveCustomStatuses(updatedStatuses);
    setEditingStatus(null);
    setShowEditDialog(false);
  };

  const deleteStatus = async (statusId: string) => {
    if (statuses.find(s => s.id === statusId)?.isDefault) {
      toast({
        title: "Erro",
        description: "Não é possível excluir status padrão",
        variant: "destructive"
      });
      return;
    }

    const updatedStatuses = statuses.filter(s => s.id !== statusId);
    await saveCustomStatuses(updatedStatuses);
  };

  const toggleStatusActive = async (statusId: string) => {
    const updatedStatuses = statuses.map(s => 
      s.id === statusId ? { ...s, isActive: !s.isActive } : s
    );
    await saveCustomStatuses(updatedStatuses);
  };

  const generateColorPalette = (baseColor: string) => {
    // Simple color palette generator
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return {
      color: baseColor,
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`
    };
  };

  const handleColorChange = (color: string, target: 'new' | 'edit') => {
    const palette = generateColorPalette(color);
    
    if (target === 'new') {
      setNewStatus(prev => ({
        ...prev,
        ...palette
      }));
    } else if (editingStatus) {
      setEditingStatus(prev => prev ? {
        ...prev,
        ...palette
      } : null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Status Personalizados
        </h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statuses.map(status => (
          <Card key={status.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge 
                  style={{
                    color: status.color,
                    backgroundColor: status.backgroundColor,
                    borderColor: status.borderColor
                  }}
                  className="border"
                >
                  {status.label}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatusActive(status.id)}
                    title={status.isActive ? 'Desativar' : 'Ativar'}
                  >
                    <Eye className={`w-4 h-4 ${status.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingStatus(status);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {!status.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteStatus(status.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Nome:</span> {status.name}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Ordem:</span> {status.order}
                </div>
                {status.description && (
                  <div className="text-sm text-muted-foreground">
                    {status.description}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: status.color }}
                  />
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: status.backgroundColor }}
                  />
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: status.borderColor }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Status Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Status</Label>
              <Input
                id="name"
                value={newStatus.name}
                onChange={(e) => setNewStatus(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: em_revisao"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Rótulo</Label>
              <Input
                id="label"
                value={newStatus.label}
                onChange={(e) => setNewStatus(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Ex: Em Revisão"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Cor Principal</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={newStatus.color}
                  onChange={(e) => handleColorChange(e.target.value, 'new')}
                  className="w-16"
                />
                <Input
                  value={newStatus.color}
                  onChange={(e) => handleColorChange(e.target.value, 'new')}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Input
                id="description"
                value={newStatus.description}
                onChange={(e) => setNewStatus(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva quando usar este status"
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm mb-2">Preview:</div>
              <Badge 
                style={{
                  color: newStatus.color,
                  backgroundColor: newStatus.backgroundColor,
                  borderColor: newStatus.borderColor
                }}
                className="border"
              >
                {newStatus.label || 'Novo Status'}
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createStatus}>
              Criar Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Status</DialogTitle>
          </DialogHeader>
          {editingStatus && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-label">Rótulo</Label>
                <Input
                  id="edit-label"
                  value={editingStatus.label}
                  onChange={(e) => setEditingStatus(prev => prev ? { ...prev, label: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Cor Principal</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-color"
                    type="color"
                    value={editingStatus.color}
                    onChange={(e) => handleColorChange(e.target.value, 'edit')}
                    className="w-16"
                  />
                  <Input
                    value={editingStatus.color}
                    onChange={(e) => handleColorChange(e.target.value, 'edit')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Input
                  id="edit-description"
                  value={editingStatus.description || ''}
                  onChange={(e) => setEditingStatus(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm mb-2">Preview:</div>
                <Badge 
                  style={{
                    color: editingStatus.color,
                    backgroundColor: editingStatus.backgroundColor,
                    borderColor: editingStatus.borderColor
                  }}
                  className="border"
                >
                  {editingStatus.label}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={updateStatus}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
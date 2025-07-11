import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface CreateActivityModalProps {
  open: boolean;
  onClose: () => void;
  dashboardId: number;
}

export default function CreateActivityModal({ open, onClose, dashboardId }: CreateActivityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    responsible: '',
    discipline: '',
    priority: 'medium',
    status: 'not_started',
    plannedStartDate: '',
    plannedEndDate: '',
    completionPercentage: '0',
    plannedCost: '0',
    actualCost: '0'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe um nome para a atividade.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const activityData = {
        ...formData,
        dashboardId,
        completionPercentage: formData.completionPercentage,
        plannedCost: formData.plannedCost,
        actualCost: formData.actualCost
      };

      await apiRequest('POST', '/api/activities', activityData);

      // Invalidar queries para atualizar a tabela
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/activities/dashboard', dashboardId] 
      });
      
      toast({
        title: "Atividade criada com sucesso",
        description: `A atividade "${formData.name}" foi criada.`
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        responsible: '',
        discipline: '',
        priority: 'medium',
        status: 'not_started',
        plannedStartDate: '',
        plannedEndDate: '',
        completionPercentage: '0',
        plannedCost: '0',
        actualCost: '0'
      });

      onClose();
    } catch (error: any) {
      console.error('Error creating activity:', error);
      toast({
        title: "Erro ao criar atividade",
        description: error.message || "Houve um problema ao criar a atividade.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Atividade</DialogTitle>
          <DialogDescription>
            Crie uma nova atividade para o dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Atividade *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Configuração do sistema"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discipline">Disciplina</Label>
              <Input
                id="discipline"
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                placeholder="Ex: Desenvolvimento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Não Iniciado</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="delayed">Atrasado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="completionPercentage">Progresso (%)</Label>
              <Input
                id="completionPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.completionPercentage}
                onChange={(e) => setFormData({ ...formData, completionPercentage: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedStartDate">Data de Início Planejada</Label>
              <Input
                id="plannedStartDate"
                type="date"
                value={formData.plannedStartDate}
                onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedEndDate">Data de Fim Planejada</Label>
              <Input
                id="plannedEndDate"
                type="date"
                value={formData.plannedEndDate}
                onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedCost">Custo Planejado</Label>
              <Input
                id="plannedCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.plannedCost}
                onChange={(e) => setFormData({ ...formData, plannedCost: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualCost">Custo Real</Label>
              <Input
                id="actualCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.actualCost}
                onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva os detalhes da atividade..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Atividade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
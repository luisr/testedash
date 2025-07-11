import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CreateSubActivityModalProps {
  parentActivity: Activity;
  onSuccess: () => void;
}

export default function CreateSubActivityModal({ 
  parentActivity, 
  onSuccess 
}: CreateSubActivityModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    responsible: parentActivity.responsible || '',
    discipline: parentActivity.discipline || '',
    priority: 'medium' as const,
    status: 'not_started' as const,
    plannedStartDate: null as Date | null,
    plannedEndDate: null as Date | null,
    completionPercentage: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe um nome para a subtarefa.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const subActivityData = {
        ...formData,
        plannedStartDate: formData.plannedStartDate ? formData.plannedStartDate.toISOString().split('T')[0] : null,
        plannedEndDate: formData.plannedEndDate ? formData.plannedEndDate.toISOString().split('T')[0] : null,
        completionPercentage: formData.completionPercentage.toString()
      };

      const response = await apiRequest('POST', `/api/activities/${parentActivity.id}/sub-activity`, subActivityData);

      toast({
        title: "Subtarefa criada com sucesso",
        description: `A subtarefa "${formData.name}" foi adicionada à atividade "${parentActivity.name}".`
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        responsible: parentActivity.responsible || '',
        discipline: parentActivity.discipline || '',
        priority: 'medium',
        status: 'not_started',
        plannedStartDate: null,
        plannedEndDate: null,
        completionPercentage: 0
      });

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating sub-activity:', error);
      toast({
        title: "Erro ao criar subtarefa",
        description: error.message || "Houve um problema ao criar a subtarefa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Subtarefa
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Criar Subtarefa para: {parentActivity.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Crie uma nova subtarefa vinculada à atividade principal. A subtarefa herdará algumas propriedades da atividade pai.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Nome da Subtarefa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome da subtarefa"
                className="input-enhanced"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsible" className="text-sm font-medium">Responsável</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                placeholder="Nome do responsável"
                className="input-enhanced"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da subtarefa"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discipline">Disciplina</Label>
              <Input
                id="discipline"
                value={formData.discipline}
                onChange={(e) => setFormData(prev => ({ ...prev, discipline: e.target.value }))}
                placeholder="Disciplina"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
              >
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
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.plannedStartDate ? (
                      format(formData.plannedStartDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.plannedStartDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, plannedStartDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.plannedEndDate ? (
                      format(formData.plannedEndDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.plannedEndDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, plannedEndDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="completion">Progresso (%)</Label>
            <Input
              id="completion"
              type="number"
              min="0"
              max="100"
              value={formData.completionPercentage}
              onChange={(e) => setFormData(prev => ({ ...prev, completionPercentage: Number(e.target.value) }))}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name}
            >
              {isSubmitting ? 'Criando...' : 'Criar Subtarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
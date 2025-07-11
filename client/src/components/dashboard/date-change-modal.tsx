import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, AlertTriangle } from "lucide-react";

interface DateChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (justification: string, changeReason?: string, impactDescription?: string) => void;
  fieldName: string;
  oldValue?: Date | null;
  newValue?: Date | null;
}

export function DateChangeModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  fieldName, 
  oldValue, 
  newValue 
}: DateChangeModalProps) {
  const [justification, setJustification] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [impactDescription, setImpactDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!justification.trim()) {
      toast({
        title: "Justificativa obrigatória",
        description: "Por favor, forneça uma justificativa para a alteração da data.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(justification, changeReason, impactDescription);
      handleClose();
    } catch (error) {
      console.error('Error confirming date change:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a alteração da data.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setJustification("");
    setChangeReason("");
    setImpactDescription("");
    onClose();
  };

  const fieldLabels: Record<string, string> = {
    plannedStartDate: "Data de Início Planejada",
    plannedEndDate: "Data de Fim Planejada",
    actualStartDate: "Data de Início Real",
    actualEndDate: "Data de Fim Real",
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Justificativa para Alteração de Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Campo sendo alterado */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Campo:</span>
              <span className="text-sm">{fieldLabels[fieldName] || fieldName}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-red-600">Valor Anterior:</span>
                <p className="text-gray-600 dark:text-gray-300">
                  {oldValue ? oldValue.toLocaleDateString('pt-BR') : 'Não definida'}
                </p>
              </div>
              <div>
                <span className="font-medium text-green-600">Novo Valor:</span>
                <p className="text-gray-600 dark:text-gray-300">
                  {newValue ? newValue.toLocaleDateString('pt-BR') : 'Não definida'}
                </p>
              </div>
            </div>
          </div>

          {/* Justificativa obrigatória */}
          <div className="space-y-2">
            <Label htmlFor="justification" className="text-sm font-medium">
              Justificativa <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="justification"
              placeholder="Descreva o motivo da alteração da data..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="min-h-[80px]"
              required
            />
          </div>

          {/* Motivo da alteração */}
          <div className="space-y-2">
            <Label htmlFor="changeReason" className="text-sm font-medium">
              Motivo da Alteração
            </Label>
            <Select value={changeReason} onValueChange={setChangeReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client_request">Solicitação do Cliente</SelectItem>
                <SelectItem value="resource_availability">Disponibilidade de Recursos</SelectItem>
                <SelectItem value="technical_issue">Problema Técnico</SelectItem>
                <SelectItem value="scope_change">Mudança no Escopo</SelectItem>
                <SelectItem value="dependency_change">Alteração de Dependência</SelectItem>
                <SelectItem value="risk_mitigation">Mitigação de Riscos</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrição do impacto */}
          <div className="space-y-2">
            <Label htmlFor="impact" className="text-sm font-medium">
              Descrição do Impacto
            </Label>
            <Textarea
              id="impact"
              placeholder="Descreva o impacto desta alteração no projeto..."
              value={impactDescription}
              onChange={(e) => setImpactDescription(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          {/* Alerta sobre auditoria */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  Registro de Auditoria
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  Esta alteração será registrada no histórico de auditoria com seu usuário, data e hora.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !justification.trim()}
          >
            {isSubmitting ? "Registrando..." : "Confirmar Alteração"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
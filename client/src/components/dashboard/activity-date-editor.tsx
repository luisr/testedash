import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DateChangeModal } from "./date-change-modal";
import { DateAuditViewer } from "./date-audit-viewer";
import { useUpdateActivityWithAudit, detectDateChanges } from "@/hooks/use-date-changes-audit";
import { Calendar, History, Edit3 } from "lucide-react";
import { format } from "date-fns";
import type { Activity } from "@shared/schema";

interface ActivityDateData {
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
}

interface ActivityDateEditorProps {
  activity: Activity;
  userId: number;
  onSuccess?: () => void;
}

export function ActivityDateEditor({ activity, userId, onSuccess }: ActivityDateEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDateChangeModal, setShowDateChangeModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{ oldActivity: Activity; newActivity: ActivityDateData } | null>(null);
  const [formData, setFormData] = useState<ActivityDateData>({
    plannedStartDate: activity.plannedStartDate ? format(new Date(activity.plannedStartDate), "yyyy-MM-dd") : "",
    plannedEndDate: activity.plannedEndDate ? format(new Date(activity.plannedEndDate), "yyyy-MM-dd") : "",
    actualStartDate: activity.actualStartDate ? format(new Date(activity.actualStartDate), "yyyy-MM-dd") : "",
    actualEndDate: activity.actualEndDate ? format(new Date(activity.actualEndDate), "yyyy-MM-dd") : "",
  });
  
  const { toast } = useToast();
  const updateActivityMutation = useUpdateActivityWithAudit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string dates to Date objects for comparison
    const newActivity = {
      ...formData,
      plannedStartDate: formData.plannedStartDate ? new Date(formData.plannedStartDate) : null,
      plannedEndDate: formData.plannedEndDate ? new Date(formData.plannedEndDate) : null,
      actualStartDate: formData.actualStartDate ? new Date(formData.actualStartDate) : null,
      actualEndDate: formData.actualEndDate ? new Date(formData.actualEndDate) : null,
    };

    // Check for date changes
    const dateChanges = detectDateChanges(activity, newActivity);
    
    if (dateChanges.length > 0) {
      // Show audit modal for justification
      setPendingChanges({ oldActivity: activity, newActivity: formData });
      setShowDateChangeModal(true);
    } else {
      // No date changes, update normally
      await updateActivity(formData);
    }
  };

  const updateActivity = async (data: ActivityDateData, justification?: string, changeReason?: string, impactDescription?: string) => {
    try {
      await updateActivityMutation.mutateAsync({
        activityId: activity.id,
        activityData: {
          plannedStartDate: data.plannedStartDate ? new Date(data.plannedStartDate) : null,
          plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : null,
          actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : null,
          actualEndDate: data.actualEndDate ? new Date(data.actualEndDate) : null,
        },
        userId,
        justification,
        changeReason,
        impactDescription,
      });

      toast({
        title: "Atividade atualizada",
        description: "As datas foram atualizadas com sucesso.",
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a atividade.",
        variant: "destructive",
      });
    }
  };

  const handleDateChangeConfirm = async (justification: string, changeReason?: string, impactDescription?: string) => {
    if (!pendingChanges) return;

    await updateActivity(pendingChanges.newActivity, justification, changeReason, impactDescription);
    setPendingChanges(null);
    setShowDateChangeModal(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setPendingChanges(null);
    setShowDateChangeModal(false);
    setFormData({
      plannedStartDate: activity.plannedStartDate ? format(new Date(activity.plannedStartDate), "yyyy-MM-dd") : "",
      plannedEndDate: activity.plannedEndDate ? format(new Date(activity.plannedEndDate), "yyyy-MM-dd") : "",
      actualStartDate: activity.actualStartDate ? format(new Date(activity.actualStartDate), "yyyy-MM-dd") : "",
      actualEndDate: activity.actualEndDate ? format(new Date(activity.actualEndDate), "yyyy-MM-dd") : "",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Editar Datas
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Editar Datas da Atividade
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plannedStartDate">Data Início Planejada</Label>
                <Input
                  id="plannedStartDate"
                  type="date"
                  value={formData.plannedStartDate || ""}
                  onChange={(e) => setFormData({...formData, plannedStartDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedEndDate">Data Fim Planejada</Label>
                <Input
                  id="plannedEndDate"
                  type="date"
                  value={formData.plannedEndDate || ""}
                  onChange={(e) => setFormData({...formData, plannedEndDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualStartDate">Data Início Real</Label>
                <Input
                  id="actualStartDate"
                  type="date"
                  value={formData.actualStartDate || ""}
                  onChange={(e) => setFormData({...formData, actualStartDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualEndDate">Data Fim Real</Label>
                <Input
                  id="actualEndDate"
                  type="date"
                  value={formData.actualEndDate || ""}
                  onChange={(e) => setFormData({...formData, actualEndDate: e.target.value})}
                />
              </div>
            </div>

              <div className="flex items-center justify-between pt-4">
                <DateAuditViewer 
                  dashboardId={activity.dashboardId!} 
                  activityId={activity.id}
                  trigger={
                    <Button variant="ghost" size="sm" className="gap-2">
                      <History className="h-4 w-4" />
                      Ver Histórico
                    </Button>
                  }
                />

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateActivityMutation.isPending}>
                    {updateActivityMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Date Change Modal */}
      {showDateChangeModal && pendingChanges && (
        <DateChangeModal
          isOpen={showDateChangeModal}
          onClose={() => {
            setShowDateChangeModal(false);
            setPendingChanges(null);
          }}
          onConfirm={handleDateChangeConfirm}
          fieldName="multiple" // We'll handle multiple fields
          oldValue={null} // We'll show details in the modal
          newValue={null}
        />
      )}
    </>
  );
}
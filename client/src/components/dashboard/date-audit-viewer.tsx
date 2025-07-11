import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDateChangesAudit, formatChangeReason } from "@/hooks/use-date-changes-audit";
import { History, Calendar, User, Clock, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateAuditViewerProps {
  dashboardId: number;
  activityId?: number;
  trigger?: React.ReactNode;
}

export function DateAuditViewer({ dashboardId, activityId, trigger }: DateAuditViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: auditRecords, isLoading, error } = useDateChangesAudit(dashboardId, activityId);

  const fieldLabels: Record<string, string> = {
    plannedStartDate: "Data de Início Planejada",
    plannedEndDate: "Data de Fim Planejada",
    actualStartDate: "Data de Início Real",
    actualEndDate: "Data de Fim Real",
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Não definida";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatDateTime = (date: string | Date) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const DefaultTrigger = () => (
    <Button variant="outline" size="sm" className="gap-2">
      <History className="h-4 w-4" />
      Histórico de Alterações
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <DefaultTrigger />}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Alterações de Datas
            {activityId && (
              <Badge variant="outline" className="ml-2">
                Atividade #{activityId}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8 text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              Erro ao carregar histórico
            </div>
          ) : !auditRecords || auditRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <History className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-lg font-medium">Nenhum histórico encontrado</p>
              <p className="text-sm text-center mt-1">
                Ainda não há registros de alterações de datas para{" "}
                {activityId ? "esta atividade" : "este dashboard"}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditRecords.map((record, index) => (
                <div key={record.id} className="border rounded-lg p-4 space-y-3">
                  {/* Header da alteração */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">
                        {fieldLabels[record.fieldName] || record.fieldName}
                      </span>
                      {record.changeReason && (
                        <Badge variant="secondary" className="text-xs">
                          {formatChangeReason(record.changeReason)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(record.createdAt)}
                    </div>
                  </div>

                  {/* Alteração de valores */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-red-600 mb-1">Valor Anterior</p>
                      <p className="text-sm">{formatDate(record.oldValue)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">Novo Valor</p>
                      <p className="text-sm">{formatDate(record.newValue)}</p>
                    </div>
                  </div>

                  {/* Justificativa */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Justificativa</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 p-3 rounded border">
                      {record.justification}
                    </p>
                  </div>

                  {/* Descrição do impacto */}
                  {record.impactDescription && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Impacto</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-orange-50 dark:bg-orange-900/20 p-3 rounded border border-orange-200 dark:border-orange-700">
                        {record.impactDescription}
                      </p>
                    </div>
                  )}

                  {/* Usuário responsável */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="h-3 w-3" />
                    <span>Alterado por usuário #{record.userId}</span>
                    {record.approvedBy && (
                      <span className="ml-2">• Aprovado por usuário #{record.approvedBy}</span>
                    )}
                  </div>

                  {index < auditRecords.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
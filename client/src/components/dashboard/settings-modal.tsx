import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Shield, FileText, Database } from "lucide-react";
import ProjectCollaborators from "./project-collaborators";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardId: number;
}

export default function SettingsModal({ open, onOpenChange, dashboardId }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("collaborators");
  
  // Get the main project ID (assuming dashboard 1 is associated with project 3)
  const projectId = dashboardId === 1 ? 3 : dashboardId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="beachpark-card max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações do Projeto
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collaborators" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Colaboradores
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permissões
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Backup
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            
            <TabsContent value="collaborators" className="space-y-4">
              <ProjectCollaborators projectId={projectId} />
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4">
              <div className="beachpark-card p-6">
                <h3 className="text-lg font-semibold mb-4">Controle de Permissões do Projeto</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Funções dos Colaboradores</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Administrador:</strong> Controle total do projeto, incluindo gerenciamento de colaboradores</div>
                      <div><strong>Gerente:</strong> Gerenciar atividades, visualizar relatórios e colaboradores</div>
                      <div><strong>Colaborador:</strong> Editar e criar atividades, visualizar dados do projeto</div>
                      <div><strong>Visualizador:</strong> Apenas visualizar informações do projeto</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Permissões Disponíveis</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>• Visualizar dados do projeto</div>
                      <div>• Editar atividades existentes</div>
                      <div>• Criar novas atividades</div>
                      <div>• Excluir atividades</div>
                      <div>• Gerenciar cronograma</div>
                      <div>• Visualizar relatórios</div>
                      <div>• Exportar dados</div>
                      <div>• Gerenciar colaboradores</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Configuração de Acesso</h4>
                    <p className="text-sm text-muted-foreground">
                      As permissões são específicas por projeto. Cada colaborador pode ter diferentes níveis de acesso em diferentes projetos.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="backup" className="space-y-4">
              <div className="beachpark-card p-6">
                <h3 className="text-lg font-semibold mb-4">Backup do Projeto</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Informações de Backup</h4>
                    <p className="text-sm text-muted-foreground">
                      Os backups incluem todas as atividades, colaboradores e configurações específicas deste projeto.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Frequência de Backup Automático</label>
                    <select className="w-full p-2 border rounded-lg beachpark-input">
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Retenção de Backups</label>
                    <select className="w-full p-2 border rounded-lg beachpark-input">
                      <option value="30">30 dias</option>
                      <option value="60">60 dias</option>
                      <option value="90">90 dias</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="beachpark-btn-primary">
                      <Database className="w-4 h-4 mr-2" />
                      Criar Backup Manual
                    </Button>
                    <Button variant="outline" className="beachpark-btn-secondary">
                      <FileText className="w-4 h-4 mr-2" />
                      Restaurar Backup
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
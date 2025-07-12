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
  const [activeTab, setActiveTab] = useState("general");
  
  // Get the main project ID (assuming dashboard 1 is associated with project 3)
  const projectId = dashboardId === 1 ? 3 : dashboardId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="beachpark-card max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações do Sistema
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Geral
            </TabsTrigger>
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
            <TabsContent value="general" className="space-y-4">
              <div className="beachpark-card p-6">
                <h3 className="text-lg font-semibold mb-4">Configurações Gerais</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome do Dashboard</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-lg"
                      placeholder="Nome do dashboard"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <textarea 
                      className="w-full p-2 border rounded-lg"
                      rows={3}
                      placeholder="Descrição do dashboard"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tema</label>
                    <select className="w-full p-2 border rounded-lg">
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                      <option value="beachpark">BeachPark</option>
                    </select>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="collaborators" className="space-y-4">
              <ProjectCollaborators projectId={projectId} />
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4">
              <div className="beachpark-card p-6">
                <h3 className="text-lg font-semibold mb-4">Controle de Permissões</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Permissões por Função</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Administrador:</strong> Controle total do projeto</div>
                      <div><strong>Gerente:</strong> Gerenciar atividades e colaboradores</div>
                      <div><strong>Colaborador:</strong> Editar e criar conteúdo</div>
                      <div><strong>Visualizador:</strong> Apenas visualizar o projeto</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Permissões Granulares</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>• Visualizar dados</div>
                      <div>• Editar atividades</div>
                      <div>• Criar conteúdo</div>
                      <div>• Excluir itens</div>
                      <div>• Gerenciar atividades</div>
                      <div>• Visualizar relatórios</div>
                      <div>• Exportar dados</div>
                      <div>• Gerenciar colaboradores</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="backup" className="space-y-4">
              <div className="beachpark-card p-6">
                <h3 className="text-lg font-semibold mb-4">Configurações de Backup</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Frequência de Backup</label>
                    <select className="w-full p-2 border rounded-lg">
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Retenção de Backups</label>
                    <select className="w-full p-2 border rounded-lg">
                      <option value="30">30 dias</option>
                      <option value="60">60 dias</option>
                      <option value="90">90 dias</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button className="beachpark-btn-primary">
                      Criar Backup Manual
                    </Button>
                    <Button variant="outline">
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
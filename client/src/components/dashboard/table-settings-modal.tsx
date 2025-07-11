import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Plus, Trash2, Edit2, Palette, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface TableSettingsModalProps {
  open: boolean;
  onClose: () => void;
  dashboardId: number;
}

export default function TableSettingsModal({ open, onClose, dashboardId }: TableSettingsModalProps) {
  const [activeTab, setActiveTab] = useState("status");
  const [isCreating, setIsCreating] = useState(false);
  const [newStatus, setNewStatus] = useState({
    name: '',
    color: '#3B82F6',
    description: ''
  });
  const [newColumn, setNewColumn] = useState({
    name: '',
    type: 'text',
    description: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar status customizados
  const { data: customStatuses = [] } = useQuery({
    queryKey: ['/api/custom-statuses', dashboardId],
    enabled: !!dashboardId,
  });

  // Buscar colunas customizadas
  const { data: customColumns = [] } = useQuery({
    queryKey: ['/api/custom-columns', dashboardId],
    enabled: !!dashboardId,
  });

  const handleCreateStatus = async () => {
    if (!newStatus.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe um nome para o status.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      await apiRequest('POST', '/api/custom-statuses', {
        ...newStatus,
        dashboardId
      });

      await queryClient.invalidateQueries({ 
        queryKey: ['/api/custom-statuses', dashboardId] 
      });

      toast({
        title: "Status criado com sucesso",
        description: `O status "${newStatus.name}" foi criado.`
      });

      setNewStatus({ name: '', color: '#3B82F6', description: '' });
    } catch (error: any) {
      toast({
        title: "Erro ao criar status",
        description: error.message || "Houve um problema ao criar o status.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateColumn = async () => {
    if (!newColumn.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe um nome para a coluna.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      await apiRequest('POST', '/api/custom-columns', {
        ...newColumn,
        dashboardId
      });

      await queryClient.invalidateQueries({ 
        queryKey: ['/api/custom-columns', dashboardId] 
      });

      toast({
        title: "Coluna criada com sucesso",
        description: `A coluna "${newColumn.name}" foi criada.`
      });

      setNewColumn({ name: '', type: 'text', description: '' });
    } catch (error: any) {
      toast({
        title: "Erro ao criar coluna",
        description: error.message || "Houve um problema ao criar a coluna.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStatus = async (statusId: number) => {
    try {
      await apiRequest('DELETE', `/api/custom-statuses/${statusId}`);
      
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/custom-statuses', dashboardId] 
      });

      toast({
        title: "Status excluído",
        description: "O status foi excluído com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir status",
        description: error.message || "Houve um problema ao excluir o status.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    try {
      await apiRequest('DELETE', `/api/custom-columns/${columnId}`);
      
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/custom-columns', dashboardId] 
      });

      toast({
        title: "Coluna excluída",
        description: "A coluna foi excluída com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir coluna",
        description: error.message || "Houve um problema ao excluir a coluna.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Configurações da Tabela
          </DialogTitle>
          <DialogDescription>
            Gerencie status personalizados, colunas customizadas e configurações da tabela.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Status Customizados</TabsTrigger>
            <TabsTrigger value="columns">Colunas</TabsTrigger>
            <TabsTrigger value="display">Exibição</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Novo Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status-name">Nome do Status</Label>
                    <Input
                      id="status-name"
                      value={newStatus.name}
                      onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                      placeholder="Ex: Em Revisão"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status-color">Cor</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="status-color"
                        type="color"
                        value={newStatus.color}
                        onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Badge 
                        style={{ backgroundColor: newStatus.color, color: 'white' }}
                        className="px-3 py-1"
                      >
                        {newStatus.name || 'Preview'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status-description">Descrição</Label>
                  <Textarea
                    id="status-description"
                    value={newStatus.description}
                    onChange={(e) => setNewStatus({ ...newStatus, description: e.target.value })}
                    placeholder="Descrição do status..."
                    rows={2}
                  />
                </div>
                
                <Button 
                  onClick={handleCreateStatus} 
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? "Criando..." : "Criar Status"}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status Existentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {customStatuses.map((status: any) => (
                    <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge 
                          style={{ backgroundColor: status.color, color: 'white' }}
                          className="px-3 py-1"
                        >
                          {status.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {status.description}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStatus(status.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {customStatuses.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum status customizado encontrado.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="columns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Nova Coluna
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="column-name">Nome da Coluna</Label>
                    <Input
                      id="column-name"
                      value={newColumn.name}
                      onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                      placeholder="Ex: Código do Projeto"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="column-type">Tipo</Label>
                    <Select value={newColumn.type} onValueChange={(value) => setNewColumn({ ...newColumn, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="date">Data</SelectItem>
                        <SelectItem value="select">Seleção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="column-description">Descrição</Label>
                  <Textarea
                    id="column-description"
                    value={newColumn.description}
                    onChange={(e) => setNewColumn({ ...newColumn, description: e.target.value })}
                    placeholder="Descrição da coluna..."
                    rows={2}
                  />
                </div>
                
                <Button 
                  onClick={handleCreateColumn} 
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? "Criando..." : "Criar Coluna"}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Colunas Existentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {customColumns.map((column: any) => (
                    <div key={column.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="px-3 py-1">
                          {column.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {column.type} - {column.description}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteColumn(column.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {customColumns.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma coluna customizada encontrada.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="display" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Exibição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Mostrar hierarquia</h4>
                    <p className="text-sm text-muted-foreground">
                      Exibir estrutura hierárquica de tarefas
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Ativado
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Mostrar progresso</h4>
                    <p className="text-sm text-muted-foreground">
                      Exibir barra de progresso nas tarefas
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Ativado
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Mostrar datas</h4>
                    <p className="text-sm text-muted-foreground">
                      Exibir datas de início e fim
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Ativado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
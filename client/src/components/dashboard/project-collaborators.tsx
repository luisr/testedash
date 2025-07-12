import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Edit2, Plus, Users, Shield, Eye, EyeOff, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProjectCollaborator {
  id: number;
  projectId: number;
  userId: number;
  role: string;
  canView: boolean;
  canEdit: boolean;
  canCreate: boolean;
  canDelete: boolean;
  canManageActivities: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageCollaborators: boolean;
  isActive: boolean;
  invitedAt: string;
  acceptedAt?: string;
  notes?: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface ProjectCollaboratorsProps {
  projectId: number;
}

const ROLE_PRESETS = {
  viewer: {
    label: "Visualizador",
    description: "Pode apenas visualizar o projeto",
    permissions: {
      canView: true,
      canEdit: false,
      canCreate: false,
      canDelete: false,
      canManageActivities: false,
      canViewReports: true,
      canExportData: false,
      canManageCollaborators: false,
    }
  },
  contributor: {
    label: "Colaborador",
    description: "Pode editar e criar conteúdo",
    permissions: {
      canView: true,
      canEdit: true,
      canCreate: true,
      canDelete: false,
      canManageActivities: true,
      canViewReports: true,
      canExportData: true,
      canManageCollaborators: false,
    }
  },
  manager: {
    label: "Gerente",
    description: "Pode gerenciar atividades e colaboradores",
    permissions: {
      canView: true,
      canEdit: true,
      canCreate: true,
      canDelete: true,
      canManageActivities: true,
      canViewReports: true,
      canExportData: true,
      canManageCollaborators: true,
    }
  },
  admin: {
    label: "Administrador",
    description: "Controle total do projeto",
    permissions: {
      canView: true,
      canEdit: true,
      canCreate: true,
      canDelete: true,
      canManageActivities: true,
      canViewReports: true,
      canExportData: true,
      canManageCollaborators: true,
    }
  }
};

export default function ProjectCollaborators({ projectId }: ProjectCollaboratorsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<ProjectCollaborator | null>(null);
  const [newCollaborator, setNewCollaborator] = useState({
    userId: "",
    role: "viewer",
    notes: "",
    permissions: ROLE_PRESETS.viewer.permissions
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar colaboradores do projeto
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useQuery<ProjectCollaborator[]>({
    queryKey: ["/api/project-collaborators", projectId],
    enabled: !!projectId,
  });

  // Buscar usuários disponíveis
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Mutation para adicionar colaborador
  const addCollaboratorMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/project-collaborators", {
        projectId,
        ...data,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-collaborators", projectId] });
      setIsAddDialogOpen(false);
      setNewCollaborator({
        userId: "",
        role: "viewer",
        notes: "",
        permissions: ROLE_PRESETS.viewer.permissions
      });
      toast({
        title: "Colaborador adicionado",
        description: "O colaborador foi adicionado com sucesso ao projeto.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar colaborador",
        description: error.message || "Ocorreu um erro ao adicionar o colaborador.",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar colaborador
  const updateCollaboratorMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/project-collaborators/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-collaborators", projectId] });
      setIsEditDialogOpen(false);
      setSelectedCollaborator(null);
      toast({
        title: "Colaborador atualizado",
        description: "As permissões do colaborador foram atualizadas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar colaborador",
        description: error.message || "Ocorreu um erro ao atualizar o colaborador.",
        variant: "destructive",
      });
    },
  });

  // Mutation para remover colaborador
  const removeCollaboratorMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/project-collaborators/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-collaborators", projectId] });
      toast({
        title: "Colaborador removido",
        description: "O colaborador foi removido do projeto.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover colaborador",
        description: error.message || "Ocorreu um erro ao remover o colaborador.",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (role: string, isNewCollaborator: boolean = true) => {
    const preset = ROLE_PRESETS[role as keyof typeof ROLE_PRESETS];
    if (isNewCollaborator) {
      setNewCollaborator(prev => ({
        ...prev,
        role,
        permissions: preset.permissions
      }));
    } else if (selectedCollaborator) {
      setSelectedCollaborator(prev => prev ? {
        ...prev,
        role,
        ...preset.permissions
      } : null);
    }
  };

  const handlePermissionChange = (permission: string, value: boolean) => {
    if (selectedCollaborator) {
      setSelectedCollaborator(prev => prev ? {
        ...prev,
        [permission]: value
      } : null);
    } else {
      setNewCollaborator(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: value
        }
      }));
    }
  };

  const handleAddCollaborator = () => {
    if (!newCollaborator.userId) {
      toast({
        title: "Usuário obrigatório",
        description: "Selecione um usuário para adicionar como colaborador.",
        variant: "destructive",
      });
      return;
    }

    addCollaboratorMutation.mutate({
      userId: parseInt(newCollaborator.userId),
      role: newCollaborator.role,
      notes: newCollaborator.notes,
      ...newCollaborator.permissions
    });
  };

  const handleUpdateCollaborator = () => {
    if (!selectedCollaborator) return;

    updateCollaboratorMutation.mutate({
      id: selectedCollaborator.id,
      role: selectedCollaborator.role,
      canView: selectedCollaborator.canView,
      canEdit: selectedCollaborator.canEdit,
      canCreate: selectedCollaborator.canCreate,
      canDelete: selectedCollaborator.canDelete,
      canManageActivities: selectedCollaborator.canManageActivities,
      canViewReports: selectedCollaborator.canViewReports,
      canExportData: selectedCollaborator.canExportData,
      canManageCollaborators: selectedCollaborator.canManageCollaborators,
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'manager': return 'bg-blue-500';
      case 'contributor': return 'bg-green-500';
      case 'viewer': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Filtrar usuários que não são colaboradores
  const availableUsers = users.filter(user => 
    !collaborators.some(collab => collab.userId === user.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Colaboradores do Projeto
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os colaboradores e suas permissões neste projeto
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="beachpark-btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="beachpark-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Colaborador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-select">Usuário</Label>
                <Select value={newCollaborator.userId} onValueChange={(value) => 
                  setNewCollaborator(prev => ({ ...prev, userId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                          <span className="text-xs text-muted-foreground">({user.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="role-select">Função</Label>
                <Select value={newCollaborator.role} onValueChange={(value) => handleRoleChange(value, true)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div className="font-medium">{preset.label}</div>
                          <div className="text-xs text-muted-foreground">{preset.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Permissões</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {Object.entries(newCollaborator.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => handlePermissionChange(key, checked)}
                      />
                      <Label htmlFor={key} className="text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Observações sobre este colaborador..."
                  value={newCollaborator.notes}
                  onChange={(e) => setNewCollaborator(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddCollaborator}
                  disabled={addCollaboratorMutation.isPending}
                  className="beachpark-btn-primary"
                >
                  {addCollaboratorMutation.isPending ? "Adicionando..." : "Adicionar Colaborador"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingCollaborators ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando colaboradores...</p>
        </div>
      ) : collaborators.length === 0 ? (
        <Card className="beachpark-card">
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum colaborador adicionado</h3>
            <p className="text-muted-foreground mb-4">
              Adicione colaboradores para permitir que outras pessoas trabalhem neste projeto.
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="beachpark-btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Colaborador
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {collaborators.map(collaborator => (
            <Card key={collaborator.id} className="beachpark-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={collaborator.user.avatar} />
                      <AvatarFallback>
                        {getInitials(collaborator.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{collaborator.user.name}</div>
                      <div className="text-sm text-muted-foreground">{collaborator.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getRoleColor(collaborator.role)} text-white`}>
                      {ROLE_PRESETS[collaborator.role as keyof typeof ROLE_PRESETS]?.label || collaborator.role}
                    </Badge>
                    <Badge variant={collaborator.isActive ? "default" : "secondary"}>
                      {collaborator.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCollaborator(collaborator);
                        setIsEditDialogOpen(true);
                      }}
                      className="beachpark-action-btn-edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCollaboratorMutation.mutate(collaborator.id)}
                      className="beachpark-action-btn-delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {collaborator.canView && <Badge variant="outline"><Eye className="w-3 h-3 mr-1" />Visualizar</Badge>}
                  {collaborator.canEdit && <Badge variant="outline"><Edit2 className="w-3 h-3 mr-1" />Editar</Badge>}
                  {collaborator.canCreate && <Badge variant="outline"><Plus className="w-3 h-3 mr-1" />Criar</Badge>}
                  {collaborator.canDelete && <Badge variant="outline"><Trash2 className="w-3 h-3 mr-1" />Excluir</Badge>}
                  {collaborator.canManageActivities && <Badge variant="outline"><Shield className="w-3 h-3 mr-1" />Atividades</Badge>}
                  {collaborator.canViewReports && <Badge variant="outline">Relatórios</Badge>}
                  {collaborator.canExportData && <Badge variant="outline">Exportar</Badge>}
                  {collaborator.canManageCollaborators && <Badge variant="outline">Gerenciar</Badge>}
                </div>

                {collaborator.notes && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Observações:</strong> {collaborator.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Collaborator Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="beachpark-card max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Colaborador</DialogTitle>
          </DialogHeader>
          {selectedCollaborator && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedCollaborator.user.avatar} />
                  <AvatarFallback>
                    {getInitials(selectedCollaborator.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{selectedCollaborator.user.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedCollaborator.user.email}</div>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-role-select">Função</Label>
                <Select value={selectedCollaborator.role} onValueChange={(value) => handleRoleChange(value, false)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div className="font-medium">{preset.label}</div>
                          <div className="text-xs text-muted-foreground">{preset.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Permissões</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {Object.entries({
                    canView: selectedCollaborator.canView,
                    canEdit: selectedCollaborator.canEdit,
                    canCreate: selectedCollaborator.canCreate,
                    canDelete: selectedCollaborator.canDelete,
                    canManageActivities: selectedCollaborator.canManageActivities,
                    canViewReports: selectedCollaborator.canViewReports,
                    canExportData: selectedCollaborator.canExportData,
                    canManageCollaborators: selectedCollaborator.canManageCollaborators,
                  }).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        id={`edit-${key}`}
                        checked={value}
                        onCheckedChange={(checked) => handlePermissionChange(key, checked)}
                      />
                      <Label htmlFor={`edit-${key}`} className="text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateCollaborator}
                  disabled={updateCollaboratorMutation.isPending}
                  className="beachpark-btn-primary"
                >
                  {updateCollaboratorMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
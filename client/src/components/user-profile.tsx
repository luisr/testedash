import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Settings, Edit2, Shield, Mail, Calendar, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UserProfileProps {
  showEditButton?: boolean;
  className?: string;
}

export function UserProfile({ showEditButton = true, className = "" }: UserProfileProps) {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/users/${user?.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setIsEditing(false);
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar o perfil.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (editData.newPassword && editData.newPassword !== editData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    const updateData: any = {
      name: editData.name,
      email: editData.email,
    };

    if (editData.newPassword) {
      updateData.currentPassword = editData.currentPassword;
      updateData.newPassword = editData.newPassword;
    }

    updateProfileMutation.mutate(updateData);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="text-xs"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'manager':
        return <Badge variant="secondary" className="text-xs"><User className="w-3 h-3 mr-1" />Gerente</Badge>;
      case 'super_user':
        return <Badge variant="default" className="text-xs bg-gradient-to-r from-purple-500 to-blue-500"><Shield className="w-3 h-3 mr-1" />Super Usuário</Badge>;
      default:
        return <Badge variant="outline" className="text-xs"><User className="w-3 h-3 mr-1" />Usuário</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <div className={className}>
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogTrigger asChild>
          {showEditButton ? (
            <Button variant="ghost" className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImageUrl} alt={user.name || user.email} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(user.name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{user.name || user.email}</span>
                <span className="text-xs text-muted-foreground">Ver perfil</span>
              </div>
            </Button>
          ) : (
            <div className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImageUrl} alt={user.name || user.email} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(user.name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{user.name || user.email}</span>
                {getRoleBadge(user.role)}
              </div>
            </div>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil do Usuário
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Avatar Central */}
            <div className="flex items-center justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profileImageUrl} alt={user.name || user.email} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {getInitials(user.name || user.email)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Informações básicas */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                {getRoleBadge(user.role)}
              </div>
            </div>

            {/* Alterar Senha */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Alterar Senha</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={editData.currentPassword}
                    onChange={(e) => setEditData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={editData.newPassword}
                    onChange={(e) => setEditData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={editData.confirmPassword}
                    onChange={(e) => setEditData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              className="beachpark-modal-btn-secondary"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updateProfileMutation.isPending}
              className="beachpark-modal-btn-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
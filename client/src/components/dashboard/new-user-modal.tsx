import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserPlus, AlertCircle } from "lucide-react";

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export default function NewUserModal({ 
  isOpen, 
  onClose, 
  onUserCreated 
}: NewUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    isActive: true,
    isSuperUser: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Default password will be set on backend
          password: 'BeachPark@123',
          mustChangePassword: true
        }),
      });

      if (response.ok) {
        onUserCreated();
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      isActive: true,
      isSuperUser: false
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: "Administrador",
      manager: "Gerente",
      user: "Usuário"
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getRoleDescription = (role: string) => {
    const descriptions = {
      admin: "Acesso total ao sistema, pode gerenciar usuários e configurações",
      manager: "Pode gerenciar projetos e atividades, visualizar relatórios",
      user: "Acesso básico, pode visualizar e editar atividades atribuídas"
    };
    return descriptions[role as keyof typeof descriptions] || "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Novo Usuário
          </DialogTitle>
          <DialogDescription>
            Adicione um novo usuário ao sistema com suas permissões.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Digite o email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="isActive">Status do Usuário</Label>
              <p className="text-sm text-muted-foreground">
                {formData.isActive ? "Usuário ativo no sistema" : "Usuário desativado"}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="isSuperUser">Super Usuário</Label>
              <p className="text-sm text-muted-foreground">
                {formData.isSuperUser ? "Acesso ao dashboard consolidado" : "Acesso padrão"}
              </p>
            </div>
            <Switch
              id="isSuperUser"
              checked={formData.isSuperUser}
              onCheckedChange={(checked) => setFormData({ ...formData, isSuperUser: checked })}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Permissões do {getRoleLabel(formData.role)}:
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {getRoleDescription(formData.role)}
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              Senha Padrão:
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              A senha padrão "BeachPark@123" será definida. O usuário deverá alterá-la no primeiro login.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
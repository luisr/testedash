import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus } from "lucide-react";

interface NewUserModalProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface NewUserData {
  name: string;
  email: string;
  role: "user" | "admin" | "manager";
}

export function NewUserModal({ trigger, isOpen, onOpenChange }: NewUserModalProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const [formData, setFormData] = useState<NewUserData>({
    name: "",
    email: "",
    role: "user"
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const open = isOpen !== undefined ? isOpen : localOpen;
  const setOpen = onOpenChange || setLocalOpen;

  const createUserMutation = useMutation({
    mutationFn: async (userData: NewUserData) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error("Erro ao criar usuário");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Usuário criado com sucesso",
        description: "O novo usuário foi adicionado ao sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e email.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(formData);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: "",
      email: "",
      role: "user"
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "manager": return "Gerente";
      case "user": return "Usuário";
      default: return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin": return "Acesso total ao sistema, pode gerenciar usuários e configurações";
      case "manager": return "Pode gerenciar projetos e atividades, supervisionar equipes";
      case "user": return "Acesso básico, pode visualizar e editar atividades atribuídas";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Criar Novo Usuário
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="usuario@exemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Nível de Permissão *</Label>
            <Select value={formData.role} onValueChange={(value: "user" | "admin" | "manager") => setFormData({...formData, role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível de permissão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  <div className="flex flex-col">
                    <span className="font-medium">Usuário</span>
                    <span className="text-sm text-muted-foreground">
                      Acesso básico, pode visualizar e editar atividades atribuídas
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex flex-col">
                    <span className="font-medium">Gerente</span>
                    <span className="text-sm text-muted-foreground">
                      Pode gerenciar projetos e atividades, supervisionar equipes
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col">
                    <span className="font-medium">Administrador</span>
                    <span className="text-sm text-muted-foreground">
                      Acesso total ao sistema, pode gerenciar usuários e configurações
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Permissões do {getRoleLabel(formData.role)}:
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {getRoleDescription(formData.role)}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { FolderPlus, DollarSign, Calendar } from "lucide-react";

interface NewProjectModalProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  dashboardId: number;
}

interface NewProjectData {
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  // managerId: number; // Temporarily removed
  status: "planning" | "active" | "on_hold" | "completed";
}

export function NewProjectModal({ trigger, isOpen, onOpenChange, dashboardId }: NewProjectModalProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const [formData, setFormData] = useState<NewProjectData>({
    name: "",
    description: "",
    budget: 0,
    startDate: "",
    endDate: "",
    status: "planning"
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const open = isOpen !== undefined ? isOpen : localOpen;
  const setOpen = onOpenChange || setLocalOpen;

  // Fetch users for manager selection - temporarily disabled
  // const { data: users = [] } = useQuery({
  //   queryKey: ["/api/users"],
  //   queryFn: async () => {
  //     const response = await fetch("/api/users");
  //     if (!response.ok) throw new Error("Erro ao carregar usuários");
  //     return response.json();
  //   },
  // });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: NewProjectData) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description,
          dashboardId,
          budget: projectData.budget.toString(), // Convert budget to string
          status: projectData.status,
          startDate: projectData.startDate || null,
          endDate: projectData.endDate || null,
          // managerId: projectData.managerId, // Temporarily removed until column is added
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar projeto");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Projeto criado com sucesso",
        description: "O novo projeto foi adicionado ao dashboard.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/dashboard/${dashboardId}`] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o nome do projeto.",
        variant: "destructive",
      });
      return;
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        toast({
          title: "Datas inválidas",
          description: "A data de início deve ser anterior à data de término.",
          variant: "destructive",
        });
        return;
      }
    }

    createProjectMutation.mutate(formData);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: "",
      description: "",
      budget: 0,
      startDate: "",
      endDate: "",
      status: "planning"
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planning": return "Planejamento";
      case "active": return "Ativo";
      case "on_hold": return "Pausado";
      case "completed": return "Concluído";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "on_hold": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Criar Novo Projeto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Digite o nome do projeto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: "planning" | "active" | "on_hold" | "completed") => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Planejamento
                    </div>
                  </SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Ativo
                    </div>
                  </SelectItem>
                  <SelectItem value="on_hold">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Pausado
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      Concluído
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição do projeto (opcional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Orçamento (R$)
              </Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})}
                placeholder="0,00"
              />
            </div>

            {/* Manager selection temporarily removed
            <div className="space-y-2">
              <Label htmlFor="managerId" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Gerente do Projeto
              </Label>
              <Select value={formData.managerId.toString()} onValueChange={(value) => setFormData({...formData, managerId: parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gerente" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Início
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Término
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Resumo do Projeto:
            </h4>
            <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <p><strong>Nome:</strong> {formData.name || "Não definido"}</p>
              <p><strong>Status:</strong> {getStatusLabel(formData.status)}</p>
              <p><strong>Orçamento:</strong> R$ {formData.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              {formData.startDate && formData.endDate && (
                <p><strong>Duração:</strong> {new Date(formData.startDate).toLocaleDateString('pt-BR')} - {new Date(formData.endDate).toLocaleDateString('pt-BR')}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? "Criando..." : "Criar Projeto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
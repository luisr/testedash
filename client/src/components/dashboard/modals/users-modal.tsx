import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Users, Plus, Search, Settings, Trash2 } from "lucide-react";
import { User as UserType } from "@shared/schema";
import { CreateUserModal } from "./create-user-modal";

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsersModal({ isOpen, onClose }: UsersModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    enabled: isOpen,
  });

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: "Admin", variant: "destructive" as const },
      manager: { label: "Gerente", variant: "default" as const },
      user: { label: "Usuário", variant: "secondary" as const },
    };
    return roleConfig[role as keyof typeof roleConfig] || { label: role, variant: "outline" as const };
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciamento de Usuários
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 h-full">
            {/* Barra de pesquisa e ações */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button 
                onClick={() => setCreateUserModalOpen(true)}
                className="beachpark-btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </div>

            {/* Lista de usuários */}
            <div className="flex-1 overflow-y-auto beachpark-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Carregando usuários...</div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="beachpark-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{user.name || user.email}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRoleBadge(user.role).variant}>
                              {getRoleBadge(user.role).label}
                            </Badge>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateUserModal
        isOpen={createUserModalOpen}
        onClose={() => setCreateUserModalOpen(false)}
      />
    </>
  );
}
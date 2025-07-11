import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Crown, Shield, Users, UserPlus, UserMinus, Mail, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  isSuperUser: boolean;
  isActive: boolean;
  createdAt: string;
}

interface SuperUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
}

export default function SuperUserModal({ isOpen, onClose, currentUserId }: SuperUserModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [superUsers, setSuperUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [promotingUser, setPromotingUser] = useState<User | null>(null);
  const [demotingUser, setDemotingUser] = useState<User | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchSuperUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuperUsers = async () => {
    try {
      const response = await fetch(`/api/super-users?userId=${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setSuperUsers(data);
      }
    } catch (error) {
      console.error('Error fetching super users:', error);
    }
  };

  const promoteToSuperUser = async (user: User) => {
    try {
      const response = await fetch(`/api/super-users/${user.id}/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUserId })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `${user.name} foi promovido(a) a super usuário.`,
          className: "bg-green-50 border-green-200"
        });
        fetchUsers();
        fetchSuperUsers();
        setPromotingUser(null);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao promover usuário.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Erro",
        description: "Erro ao promover usuário.",
        variant: "destructive"
      });
    }
  };

  const demoteFromSuperUser = async (user: User) => {
    try {
      const response = await fetch(`/api/super-users/${user.id}/demote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUserId })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `${user.name} foi rebaixado(a) de super usuário.`,
          className: "bg-blue-50 border-blue-200"
        });
        fetchUsers();
        fetchSuperUsers();
        setDemotingUser(null);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao rebaixar usuário.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error demoting user:', error);
      toast({
        title: "Erro",
        description: "Erro ao rebaixar usuário.",
        variant: "destructive"
      });
    }
  };

  const regularUsers = users.filter(user => !user.isSuperUser);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Gerenciar Super Usuários
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Super Users */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Super Usuários Atuais</h3>
                <Badge variant="secondary" className="ml-2">
                  {superUsers.length}
                </Badge>
              </div>
              
              {superUsers.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-gray-500">Nenhum super usuário encontrado.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {superUsers.map((user) => (
                    <Card key={user.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                              <Crown className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{user.name}</h4>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {user.role}
                                </Badge>
                                <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                  Super Usuário
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {user.id !== currentUserId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDemotingUser(user)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              Rebaixar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Regular Users */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold">Usuários Regulares</h3>
                <Badge variant="secondary" className="ml-2">
                  {regularUsers.length}
                </Badge>
              </div>
              
              {regularUsers.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-gray-500">Todos os usuários são super usuários.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {regularUsers.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{user.name}</h4>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {user.role}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Usuário Regular
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPromotingUser(user)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Promover
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Promotion Confirmation Dialog */}
      <AlertDialog open={!!promotingUser} onOpenChange={() => setPromotingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Promover a Super Usuário
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja promover <strong>{promotingUser?.name}</strong> a super usuário?
              <br /><br />
              Super usuários têm acesso a:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Dashboard consolidado de todos os projetos</li>
                <li>Gerenciamento de outros super usuários</li>
                <li>Controle total sobre o sistema</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => promotingUser && promoteToSuperUser(promotingUser)}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Promover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Demotion Confirmation Dialog */}
      <AlertDialog open={!!demotingUser} onOpenChange={() => setDemotingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Rebaixar Super Usuário
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja remover os privilégios de super usuário de <strong>{demotingUser?.name}</strong>?
              <br /><br />
              Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remover acesso ao dashboard consolidado</li>
                <li>Remover capacidade de gerenciar super usuários</li>
                <li>Manter apenas as permissões regulares do usuário</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => demotingUser && demoteFromSuperUser(demotingUser)}
              className="bg-red-500 hover:bg-red-600"
            >
              Rebaixar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
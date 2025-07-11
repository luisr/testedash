import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Users, Calendar, Settings, Trash2, Edit, Eye, UserPlus } from "lucide-react";
import { DashboardShare } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (data: any) => void;
  dashboardId: number;
}

export default function ShareModalEnhanced({ isOpen, onClose, onShare, dashboardId }: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [notify, setNotify] = useState(true);
  const [activeTab, setActiveTab] = useState("add");
  const [existingShares, setExistingShares] = useState<DashboardShare[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Advanced permissions for granular control
  const [granularPermissions, setGranularPermissions] = useState({
    canView: true,
    canEdit: false,
    canDelete: false,
    canShare: false,
    canExport: false,
    canCreateActivities: false,
    canEditActivities: false,
    canDeleteActivities: false,
    canViewReports: true,
    canManageCustomColumns: false,
    canManageCustomCharts: false,
  });
  
  const [expirationDate, setExpirationDate] = useState("");
  const [notes, setNotes] = useState("");

  // Load existing shares when modal opens
  useEffect(() => {
    if (isOpen) {
      loadExistingShares();
    }
  }, [isOpen, dashboardId]);

  const loadExistingShares = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", `/api/dashboard-shares/${dashboardId}`);
      const shares = await response.json();
      setExistingShares(shares);
    } catch (error) {
      console.error('Error loading shares:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set granular permissions based on permission level
  useEffect(() => {
    switch (permission) {
      case "view":
        setGranularPermissions({
          canView: true,
          canEdit: false,
          canDelete: false,
          canShare: false,
          canExport: false,
          canCreateActivities: false,
          canEditActivities: false,
          canDeleteActivities: false,
          canViewReports: true,
          canManageCustomColumns: false,
          canManageCustomCharts: false,
        });
        break;
      case "edit":
        setGranularPermissions({
          canView: true,
          canEdit: true,
          canDelete: false,
          canShare: false,
          canExport: true,
          canCreateActivities: true,
          canEditActivities: true,
          canDeleteActivities: false,
          canViewReports: true,
          canManageCustomColumns: false,
          canManageCustomCharts: false,
        });
        break;
      case "admin":
        setGranularPermissions({
          canView: true,
          canEdit: true,
          canDelete: true,
          canShare: true,
          canExport: true,
          canCreateActivities: true,
          canEditActivities: true,
          canDeleteActivities: true,
          canViewReports: true,
          canManageCustomColumns: true,
          canManageCustomCharts: true,
        });
        break;
    }
  }, [permission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const shareData = {
      email,
      permission,
      notify,
      dashboardId,
      expiresAt: expirationDate ? new Date(expirationDate).toISOString() : null,
      notes,
      ...granularPermissions
    };
    
    try {
      await onShare(shareData);
      // Reset form
      setEmail("");
      setPermission("view");
      setNotify(true);
      setExpirationDate("");
      setNotes("");
      // Reload shares
      await loadExistingShares();
      setActiveTab("manage");
    } catch (error) {
      console.error('Error sharing dashboard:', error);
    }
  };

  const handleDeleteShare = async (shareId: number) => {
    try {
      await apiRequest("DELETE", `/api/dashboard-shares/${shareId}`);
      await loadExistingShares();
    } catch (error) {
      console.error('Error deleting share:', error);
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case "view": return "bg-blue-100 text-blue-800";
      case "edit": return "bg-green-100 text-green-800";
      case "admin": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "view": return <Eye className="h-3 w-3" />;
      case "edit": return <Edit className="h-3 w-3" />;
      case "admin": return <Settings className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Compartilhar Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Adicionar Usuário
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gerenciar Acesso ({existingShares.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email do usuário</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="permission">Nível de acesso</Label>
                  <Select value={permission} onValueChange={setPermission}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível de acesso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          Visualizar
                        </div>
                      </SelectItem>
                      <SelectItem value="edit">
                        <div className="flex items-center gap-2">
                          <Edit className="h-3 w-3" />
                          Editar
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Settings className="h-3 w-3" />
                          Administrar
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiration">Data de expiração (opcional)</Label>
                  <Input
                    id="expiration"
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="notify"
                    checked={notify}
                    onCheckedChange={(checked) => setNotify(checked as boolean)}
                  />
                  <Label htmlFor="notify" className="text-sm">
                    Enviar notificação por email
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione notas sobre este compartilhamento..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Granular Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Permissões Detalhadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Visualização</Label>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={granularPermissions.canView}
                            onCheckedChange={(checked) => 
                              setGranularPermissions(prev => ({...prev, canView: checked as boolean}))
                            }
                          />
                          <span className="text-sm">Visualizar dashboard</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={granularPermissions.canViewReports}
                            onCheckedChange={(checked) => 
                              setGranularPermissions(prev => ({...prev, canViewReports: checked as boolean}))
                            }
                          />
                          <span className="text-sm">Visualizar relatórios</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={granularPermissions.canExport}
                            onCheckedChange={(checked) => 
                              setGranularPermissions(prev => ({...prev, canExport: checked as boolean}))
                            }
                          />
                          <span className="text-sm">Exportar dados</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Atividades</Label>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={granularPermissions.canCreateActivities}
                            onCheckedChange={(checked) => 
                              setGranularPermissions(prev => ({...prev, canCreateActivities: checked as boolean}))
                            }
                          />
                          <span className="text-sm">Criar atividades</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={granularPermissions.canEditActivities}
                            onCheckedChange={(checked) => 
                              setGranularPermissions(prev => ({...prev, canEditActivities: checked as boolean}))
                            }
                          />
                          <span className="text-sm">Editar atividades</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={granularPermissions.canDeleteActivities}
                            onCheckedChange={(checked) => 
                              setGranularPermissions(prev => ({...prev, canDeleteActivities: checked as boolean}))
                            }
                          />
                          <span className="text-sm">Excluir atividades</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Administração</Label>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={granularPermissions.canEdit}
                            onCheckedChange={(checked) => 
                              setGranularPermissions(prev => ({...prev, canEdit: checked as boolean}))
                            }
                          />
                          <span className="text-sm">Editar dashboard</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={granularPermissions.canShare}
                            onCheckedChange={(checked) => 
                              setGranularPermissions(prev => ({...prev, canShare: checked as boolean}))
                            }
                          />
                          <span className="text-sm">Compartilhar dashboard</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={granularPermissions.canDelete}
                            onCheckedChange={(checked) => 
                              setGranularPermissions(prev => ({...prev, canDelete: checked as boolean}))
                            }
                          />
                          <span className="text-sm">Excluir dashboard</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Personalização</Label>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={granularPermissions.canManageCustomColumns}
                            onCheckedChange={(checked) => 
                              setGranularPermissions(prev => ({...prev, canManageCustomColumns: checked as boolean}))
                            }
                          />
                          <span className="text-sm">Gerenciar colunas</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={granularPermissions.canManageCustomCharts}
                            onCheckedChange={(checked) => 
                              setGranularPermissions(prev => ({...prev, canManageCustomCharts: checked as boolean}))
                            }
                          />
                          <span className="text-sm">Gerenciar gráficos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Compartilhar
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="manage" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Carregando compartilhamentos...</p>
              </div>
            ) : existingShares.length > 0 ? (
              <div className="space-y-4">
                {existingShares.map((share) => (
                  <Card key={share.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {getPermissionIcon(share.permission || 'view')}
                          </div>
                          <div>
                            <p className="font-medium">Usuário ID: {share.userId}</p>
                            <p className="text-sm text-muted-foreground">
                              Compartilhado em {formatDate(share.createdAt?.toString() || '')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPermissionColor(share.permission || 'view')}>
                            {share.permission === 'view' ? 'Visualizar' :
                             share.permission === 'edit' ? 'Editar' :
                             share.permission === 'admin' ? 'Administrar' : share.permission}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteShare(share.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Permissões ativas</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {share.canView && <Badge variant="secondary" className="text-xs">Visualizar</Badge>}
                            {share.canEdit && <Badge variant="secondary" className="text-xs">Editar</Badge>}
                            {share.canExport && <Badge variant="secondary" className="text-xs">Exportar</Badge>}
                            {share.canCreateActivities && <Badge variant="secondary" className="text-xs">Criar Atividades</Badge>}
                            {share.canShare && <Badge variant="secondary" className="text-xs">Compartilhar</Badge>}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={share.isActive ? "default" : "secondary"}>
                              {share.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                            {share.expiresAt && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                Expira em {formatDate(share.expiresAt.toString())}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {share.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Notas:</p>
                          <p className="text-sm">{share.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum compartilhamento encontrado</p>
                <p className="text-sm text-muted-foreground">
                  Adicione usuários para começar a compartilhar este dashboard
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
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

export default function ShareModal({ isOpen, onClose, onShare, dashboardId }: ShareModalProps) {
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Compartilhar Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <SelectItem value="view">Visualizar</SelectItem>
                <SelectItem value="edit">Editar</SelectItem>
                <SelectItem value="admin">Administrar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify"
              checked={notify}
              onCheckedChange={(checked) => setNotify(checked as boolean)}
            />
            <Label htmlFor="notify" className="text-sm">
              Enviar notificação por email
            </Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Compartilhar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

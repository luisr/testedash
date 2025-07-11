import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FolderOpen, 
  Calendar, 
  DollarSign, 
  Users, 
  BarChart3, 
  LogOut,
  Shield,
  Eye,
  Edit3,
  Plus,
  FileText,
  Settings
} from "lucide-react";
import beachParkLogo from "@assets/pngegg_1752264509099.png";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  budget: string;
  actualCost: string;
  startDate: string;
  endDate: string;
  dashboardId: number;
}

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
  project: Project;
}

export default function Projects() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [collaborations, setCollaborations] = useState<ProjectCollaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authUser = localStorage.getItem("authUser");
    if (!authUser) {
      setLocation("/login");
      return;
    }

    const userData = JSON.parse(authUser);
    setUser(userData);
    fetchUserCollaborations(userData.id);
  }, [setLocation]);

  const fetchUserCollaborations = async (userId: number) => {
    try {
      const response = await fetch(`/api/auth/user-collaborations/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCollaborations(data);
      } else {
        console.error("Failed to fetch collaborations");
      }
    } catch (error) {
      console.error("Error fetching collaborations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setLocation("/login");
  };

  const handleAccessProject = (projectId: number) => {
    setLocation(`/dashboard?projectId=${projectId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'paused': return 'Pausado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'contributor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'contributor': return 'Colaborador';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  const getPermissionIcons = (collaboration: ProjectCollaborator) => {
    const icons = [];
    if (collaboration.canView) icons.push(<Eye key="view" className="w-4 h-4" />);
    if (collaboration.canEdit) icons.push(<Edit3 key="edit" className="w-4 h-4" />);
    if (collaboration.canCreate) icons.push(<Plus key="create" className="w-4 h-4" />);
    if (collaboration.canManageActivities) icons.push(<Settings key="manage" className="w-4 h-4" />);
    if (collaboration.canViewReports) icons.push(<FileText key="reports" className="w-4 h-4" />);
    if (collaboration.canExportData) icons.push(<BarChart3 key="export" className="w-4 h-4" />);
    return icons;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen dashboard-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-container">
      {/* Header */}
      <div className="border-b border-white/20 bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white p-1">
                <img src={beachParkLogo} alt="BeachPark Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tô Sabendo</h1>
                <p className="text-sm text-muted-foreground">Seus Projetos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div className="text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Projetos Colaborativos
          </h2>
          <p className="text-muted-foreground">
            Você tem acesso a {collaborations.length} projeto(s) como colaborador
          </p>
        </div>

        {collaborations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground">
                Você não tem acesso a nenhum projeto no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collaborations.map((collaboration) => (
              <Card key={collaboration.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1 text-foreground">
                        {collaboration.project.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {collaboration.project.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(collaboration.project.status)}>
                      {getStatusLabel(collaboration.project.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Project Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {collaboration.project.startDate ? 
                          new Date(collaboration.project.startDate).toLocaleDateString('pt-BR') : 
                          'Não definido'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        Orçamento: R$ {Number(collaboration.project.budget).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Role and Permissions */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(collaboration.role)}>
                        {getRoleLabel(collaboration.role)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Permissões:</span>
                      <div className="flex gap-1">
                        {getPermissionIcons(collaboration)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <Button
                      onClick={() => handleAccessProject(collaboration.project.id)}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Acessar Projeto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
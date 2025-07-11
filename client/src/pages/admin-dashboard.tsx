import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Users, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield,
  Edit,
  Trash2,
  UserPlus,
  FileText,
  Calendar,
  DollarSign,
  Eye,
  Download,
  Search,
  Filter
} from "lucide-react";
import beachParkLogo from "@assets/pngegg_1752264509099.png";
import NewUserModal from "@/components/dashboard/new-user-modal";
import NewProjectModal from "@/components/dashboard/new-project-modal";
import EditUserModal from "@/components/dashboard/edit-user-modal";
import ChangePasswordModal from "@/components/auth/change-password-modal";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  isSuperUser: boolean;
  createdAt: string;
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

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Generate reports function
  const generateReport = (type: string) => {
    let reportContent = '';
    let filename = '';
    
    switch (type) {
      case 'projects':
        reportContent = generateProjectsReport();
        filename = 'relatorio-projetos.txt';
        break;
      case 'users':
        reportContent = generateUsersReport();
        filename = 'relatorio-usuarios.txt';
        break;
      case 'financial':
        reportContent = generateFinancialReport();
        filename = 'relatorio-financeiro.txt';
        break;
      default:
        reportContent = generateGeneralReport();
        filename = 'relatorio-geral.txt';
    }
    
    // Download the report
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateProjectsReport = () => {
    const date = new Date().toLocaleDateString('pt-BR');
    let content = `RELATÓRIO DE PROJETOS - ${date}\n`;
    content += `===============================================\n\n`;
    
    projects.forEach(project => {
      content += `PROJETO: ${project.name}\n`;
      content += `Status: ${project.status}\n`;
      content += `Orçamento: R$ ${project.budget}\n`;
      content += `Custo Real: R$ ${project.actualCost}\n`;
      content += `Data Início: ${project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'N/A'}\n`;
      content += `Data Fim: ${project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'N/A'}\n`;
      content += `Descrição: ${project.description || 'N/A'}\n`;
      content += `-------------------------------------------\n\n`;
    });
    
    return content;
  };

  const generateUsersReport = () => {
    const date = new Date().toLocaleDateString('pt-BR');
    let content = `RELATÓRIO DE USUÁRIOS - ${date}\n`;
    content += `===============================================\n\n`;
    
    users.forEach(user => {
      content += `USUÁRIO: ${user.name}\n`;
      content += `Email: ${user.email}\n`;
      content += `Função: ${getRoleLabel(user.role)}\n`;
      content += `Status: ${user.isActive ? 'Ativo' : 'Inativo'}\n`;
      content += `Super Usuário: ${user.isSuperUser ? 'Sim' : 'Não'}\n`;
      content += `-------------------------------------------\n\n`;
    });
    
    return content;
  };

  const generateFinancialReport = () => {
    const date = new Date().toLocaleDateString('pt-BR');
    let content = `RELATÓRIO FINANCEIRO - ${date}\n`;
    content += `===============================================\n\n`;
    
    const totalBudget = projects.reduce((sum, project) => sum + parseFloat(project.budget || '0'), 0);
    const totalActual = projects.reduce((sum, project) => sum + parseFloat(project.actualCost || '0'), 0);
    
    content += `RESUMO GERAL:\n`;
    content += `Total Orçado: R$ ${totalBudget.toFixed(2)}\n`;
    content += `Total Gasto: R$ ${totalActual.toFixed(2)}\n`;
    content += `Diferença: R$ ${(totalBudget - totalActual).toFixed(2)}\n\n`;
    
    content += `DETALHAMENTO POR PROJETO:\n`;
    projects.forEach(project => {
      const budget = parseFloat(project.budget || '0');
      const actual = parseFloat(project.actualCost || '0');
      const variance = budget - actual;
      
      content += `${project.name}:\n`;
      content += `  Orçamento: R$ ${budget.toFixed(2)}\n`;
      content += `  Gasto: R$ ${actual.toFixed(2)}\n`;
      content += `  Variação: R$ ${variance.toFixed(2)}\n`;
      content += `-------------------------------------------\n\n`;
    });
    
    return content;
  };

  const generateGeneralReport = () => {
    const date = new Date().toLocaleDateString('pt-BR');
    let content = `RELATÓRIO GERAL - ${date}\n`;
    content += `===============================================\n\n`;
    
    content += `RESUMO EXECUTIVO:\n`;
    content += `Total de Projetos: ${projects.length}\n`;
    content += `Total de Usuários: ${users.length}\n`;
    content += `Usuários Ativos: ${users.filter(u => u.isActive).length}\n`;
    content += `Super Usuários: ${users.filter(u => u.isSuperUser).length}\n\n`;
    
    content += `PROJETOS POR STATUS:\n`;
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      content += `${status}: ${count}\n`;
    });
    
    content += `\nUSUÁRIOS POR FUNÇÃO:\n`;
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(roleCounts).forEach(([role, count]) => {
      content += `${getRoleLabel(role)}: ${count}\n`;
    });
    
    return content;
  };
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setLocation("/login");
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: "Administrador",
      manager: "Gerente",
      user: "Usuário"
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      paused: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === "all" || p.status === filterStatus)
  );

  if (!user) return null;

  return (
    <div className="min-h-screen dashboard-container">
      {/* Header */}
      <div className="border-b border-white/20 bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white p-1">
                <img src={beachParkLogo} alt="BeachPark Logo" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tô Sabendo</h1>
                <p className="text-sm text-muted-foreground">Painel de Administração</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
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
                {user.isSuperUser && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    Super User
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-xs text-muted-foreground">Projetos ativos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {projects.reduce((sum, p) => sum + parseFloat(p.budget || '0'), 0).toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-muted-foreground">Em todos os projetos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Relatórios gerados</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projetos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">{project.description}</div>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usuários Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.filter(u => u.isActive).slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{getRoleLabel(user.role)}</div>
                        </div>
                        {user.isSuperUser && (
                          <Badge variant="secondary">
                            <Shield className="w-3 h-3 mr-1" />
                            Super
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciamento de Projetos</h2>
              <Button onClick={() => setShowNewProjectModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Projeto
              </Button>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar projetos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="completed">Concluído</option>
                <option value="paused">Pausado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Orçamento:</span>
                        <span className="font-medium">R$ {parseFloat(project.budget || '0').toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Custo Atual:</span>
                        <span className="font-medium">R$ {parseFloat(project.actualCost || '0').toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Data de Início:</span>
                        <span className="font-medium">{new Date(project.startDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
              <Button onClick={() => setShowNewUserModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Role:</span>
                        <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {user.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      {user.isSuperUser && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Privilégios:</span>
                          <Badge className="bg-purple-100 text-purple-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Super User
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Relatórios</h2>
              <Button onClick={() => generateReport('general')}>
                <Download className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Relatório de Projetos
                  </CardTitle>
                  <CardDescription>Visão geral do status dos projetos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => generateReport('projects')}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Relatório de Usuários
                  </CardTitle>
                  <CardDescription>Lista completa de usuários e permissões</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => generateReport('users')}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Relatório Financeiro
                  </CardTitle>
                  <CardDescription>Análise de orçamentos e custos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => generateReport('financial')}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Meu Perfil</CardTitle>
                  <CardDescription>Gerencie suas informações pessoais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{user.name}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <Badge className="mt-2">{getRoleLabel(user.role)}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" value={user.name} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user.email} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="role">Função</Label>
                      <Input id="role" value={getRoleLabel(user.role)} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Input id="status" value={user.isActive ? "Ativo" : "Inativo"} readOnly />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setShowChangePasswordModal(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Alterar Senha
                    </Button>
                    <Button variant="outline" onClick={() => handleEditUser(user)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <NewUserModal
        isOpen={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        onUserCreated={fetchUsers}
      />
      
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onProjectCreated={fetchProjects}
      />
      
      {editingUser && (
        <EditUserModal
          isOpen={showEditUserModal}
          onClose={() => {
            setShowEditUserModal(false);
            setEditingUser(null);
          }}
          user={editingUser}
          onUserUpdated={fetchUsers}
        />
      )}
      
      {user && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          userId={user.id}
          onPasswordChanged={() => setShowChangePasswordModal(false)}
        />
      )}
    </div>
  );
}
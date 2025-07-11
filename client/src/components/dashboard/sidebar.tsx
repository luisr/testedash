import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Activity, 
  LayoutDashboard, 
  Folder, 
  Calendar, 
  BarChart3, 
  Users, 
  Share2, 
  Settings,
  LogOut,
  X,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityLogToggle: () => void;
}

export default function Sidebar({ isOpen, onClose, onActivityLogToggle }: SidebarProps) {
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, current: true },
    { name: "Projetos", href: "/projects", icon: Folder, current: false },
    { name: "Cronograma", href: "/schedule", icon: Calendar, current: false },
    { name: "Relatórios", href: "/reports", icon: BarChart3, current: false },
  ];

  const adminNavigation = [
    { name: "Usuários", href: "/users", icon: Users, current: false },
    { name: "Compartilhamentos", href: "/shares", icon: Share2, current: false },
    { name: "Logs de Atividade", href: "#", icon: Activity, current: false, onClick: onActivityLogToggle },
    { name: "Configurações", href: "/settings", icon: Settings, current: false },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 sidebar-container shadow-elegant-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-elegant">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">ProjectHub</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="lg:hidden hover-lift focus-ring"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="mt-6 px-4 space-y-6">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={item.current ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start space-x-3 py-3 px-3 rounded-lg font-medium transition-all",
                    item.current 
                      ? "bg-primary text-primary-foreground shadow-elegant hover:bg-primary/90" 
                      : "text-foreground hover:bg-accent hover:text-accent-foreground hover-lift"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
              Administração
            </h3>
            <div className="space-y-1">
              {adminNavigation.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="w-full justify-start space-x-3 py-3 px-3 rounded-lg font-medium text-foreground hover:bg-accent hover:text-accent-foreground hover-lift transition-all"
                  onClick={item.onClick}
                  asChild={!item.onClick}
                >
                  {item.onClick ? (
                    <>
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </>
                  ) : (
                    <Link href={item.href}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-border/50">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <Avatar className="w-10 h-10 shadow-elegant">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" alt="Avatar" />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">JS</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                João Silva
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Administrador
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-muted-foreground hover:text-foreground hover-lift focus-ring rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

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
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-background shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-sidebar-foreground">ProjectHub</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground hover:text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="mt-6 px-6">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={item.current ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start space-x-2",
                    item.current 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>
          
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-3">
              Administração
            </h3>
            <div className="mt-2 space-y-1">
              {adminNavigation.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="w-full justify-start space-x-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={item.onClick}
                  asChild={!item.onClick}
                >
                  {item.onClick ? (
                    <>
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </>
                  ) : (
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </nav>
        
        <div className="absolute bottom-0 w-full p-6 border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" alt="Avatar" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                João Silva
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                Administrador
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

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
import beachParkLogo from "@assets/pngegg_1752264509099.png";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityLogToggle: () => void;
  onUsersClick?: () => void;
  onProjectsClick?: () => void;
  onReportsClick?: () => void;
  onSettingsClick?: () => void;
  onScheduleClick?: () => void;
}

export default function Sidebar({ isOpen, onClose, onActivityLogToggle, onUsersClick, onProjectsClick, onReportsClick, onSettingsClick, onScheduleClick }: SidebarProps) {
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, current: true },
    { name: "Projetos", href: "#", icon: Folder, current: false, onClick: onProjectsClick },
    { name: "Cronograma", href: "#", icon: Calendar, current: false, onClick: onScheduleClick },
    { name: "Relatórios", href: "#", icon: BarChart3, current: false, onClick: onReportsClick },
  ];

  const adminNavigation = [
    { name: "Usuários", href: "#", icon: Users, current: false, onClick: onUsersClick },
    { name: "Compartilhamentos", href: "/shares", icon: Share2, current: false },
    { name: "Logs de Atividade", href: "#", icon: Activity, current: false, onClick: onActivityLogToggle },
    { name: "Configurações", href: "#", icon: Settings, current: false, onClick: onSettingsClick },
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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-elegant hover-lift">
              <img src={beachParkLogo} alt="BeachPark Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Tô Sabendo</h1>
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
              <Button
                key={item.name}
                variant={item.current ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start space-x-3 py-3 px-3 rounded-lg font-medium transition-all",
                  item.current 
                    ? "bg-primary text-primary-foreground shadow-elegant hover:bg-primary/90" 
                    : "text-foreground hover:bg-accent hover:text-accent-foreground hover-lift"
                )}
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
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-all duration-300 hover-lift">
            <Avatar className="w-10 h-10 shadow-elegant ring-2 ring-primary/20">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" alt="Avatar" />
              <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">JS</AvatarFallback>
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

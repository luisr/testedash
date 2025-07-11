import { Button } from "@/components/ui/button";
import { Menu, Share2, Download, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/dashboard/theme-provider";

interface HeaderProps {
  dashboardName: string;
  onMenuClick: () => void;
  onShareClick: () => void;
  onExportClick: () => void;
  rightContent?: React.ReactNode;
}

export default function Header({ 
  dashboardName, 
  onMenuClick, 
  onShareClick, 
  onExportClick,
  rightContent
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header-container shadow-elegant sticky top-0 z-30 animate-fade-in">
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden hover-lift focus-ring"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gradient bg-gradient-to-r from-primary to-primary/80 bg-clip-text">
              {dashboardName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Visão geral dos projetos e atividades
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {rightContent}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground hover-lift focus-ring rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
          
          <Button
            onClick={onShareClick}
            className="flex items-center space-x-2 hover-lift focus-ring px-4 py-2 rounded-lg gradient-primary font-medium shadow-elegant"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={onExportClick}
            className="flex items-center space-x-2 hover-lift focus-ring px-4 py-2 rounded-lg font-medium shadow-elegant"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

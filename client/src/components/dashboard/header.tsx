import { Button } from "@/components/ui/button";
import { Menu, Share2, Download, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/dashboard/theme-provider";

interface HeaderProps {
  dashboardName: string;
  onMenuClick: () => void;
  onShareClick: () => void;
  onExportClick: () => void;
}

export default function Header({ 
  dashboardName, 
  onMenuClick, 
  onShareClick, 
  onExportClick 
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {dashboardName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Visão geral dos projetos e atividades
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
          
          <Button
            onClick={onShareClick}
            className="flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={onExportClick}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  FolderOpen, 
  FileText, 
  Settings, 
  BarChart3,
  Calendar,
  Bell,
  Search,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/monday-button';
import { Input } from '@/components/ui/monday-input';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import beachParkLogo from '@assets/pngegg_1752264509099.png';

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projetos', href: '/projects', icon: FolderOpen },
  { name: 'Usuários', href: '/users', icon: Users },
  { name: 'Relatórios', href: '/reports', icon: FileText },
  { name: 'Análise', href: '/analytics', icon: BarChart3 },
  { name: 'Calendário', href: '/calendar', icon: Calendar },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function MondaySidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className={cn('sidebar', className)}>
      <div className="sidebar-header">
        <div className="flex items-center gap-sm">
          <img src={beachParkLogo} alt="BeachPark" className="w-8 h-8 object-contain" />
          <div>
            <h2 className="text-lg font-semibold text-primary">BeachPark</h2>
            <p className="text-xs text-secondary">Tô Sabendo</p>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="space-y-md">
          <Button variant="primary" className="w-full justify-start">
            <Plus className="w-4 h-4" />
            Novo Projeto
          </Button>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary" />
            <Input
              type="text"
              placeholder="Buscar..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        <nav className="space-y-xs mt-lg">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'nav-item',
                  isActive && 'active'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-md border-t border-light">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
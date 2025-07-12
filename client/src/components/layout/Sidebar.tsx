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
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className={cn('sidebar', className)}>
      <div className="sidebar-header">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BP</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary">BeachPark</h2>
            <p className="text-xs text-secondary">Tô Sabendo</p>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="mb-md">
          <button className="btn btn-primary w-full justify-start gap-2">
            <Plus className="w-4 h-4" />
            Novo Projeto
          </button>
        </div>

        <div className="mb-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Buscar..."
              className="input pl-10 w-full"
            />
          </div>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'sidebar-nav-item',
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

      <div className="mt-auto p-md border-t border-secondary">
        <div className="flex items-center justify-between">
          <button className="btn btn-ghost p-sm">
            <Bell className="w-4 h-4" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
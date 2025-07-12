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
    <div className={cn('sidebar', className)} style={{ 
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white'
    }}>
      <div className="sidebar-header">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BP</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">BeachPark</h2>
            <p className="text-xs text-white/70">Tô Sabendo</p>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="mb-md">
          <button className="btn btn-primary w-full justify-start gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
            <Plus className="w-4 h-4" />
            Novo Projeto
          </button>
        </div>

        <div className="mb-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type="text"
              placeholder="Buscar..."
              className="input pl-10 w-full bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
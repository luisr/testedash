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
    <div className={cn('monday-sidebar', className)}>
      <div className="monday-p-lg">
        <div className="monday-flex monday-items-center monday-gap-sm">
          <img src={beachParkLogo} alt="BeachPark" className="w-8 h-8 object-contain" />
          <div>
            <h2 className="monday-text-lg monday-font-semibold" style={{ color: 'var(--monday-text-primary)' }}>BeachPark</h2>
            <p className="monday-text-xs" style={{ color: 'var(--monday-text-secondary)' }}>Tô Sabendo</p>
          </div>
        </div>
      </div>

      <div className="monday-p-md">
        <div className="monday-mb-lg">
          <button 
            className="monday-btn monday-btn-primary monday-w-full monday-justify-start"
            onClick={() => window.location.href = '/projects'}
          >
            <Plus className="w-4 h-4" />
            Novo Projeto
          </button>
        </div>

        <div className="monday-mb-lg">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--monday-text-tertiary)' }} />
            <input
              type="text"
              placeholder="Buscar..."
              className="monday-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        <nav className="monday-flex monday-flex-col monday-gap-sm">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + '/');
            
            return (
              <button
                key={item.name}
                onClick={() => window.location.href = item.href}
                className={cn(
                  'monday-nav-item',
                  isActive && 'active'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto monday-p-md border-t" style={{ borderColor: 'var(--monday-border)' }}>
        <div className="monday-flex monday-items-center monday-justify-between">
          <button className="monday-btn monday-btn-secondary monday-p-sm">
            <Bell className="w-4 h-4" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
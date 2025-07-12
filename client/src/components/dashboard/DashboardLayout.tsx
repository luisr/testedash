import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './sidebar';
import Header from './header';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  dashboardId: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, dashboardId }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen beachpark-gradient-bg">
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          onActivityLogToggle={() => {}}
          onUsersClick={() => {}}
          onProjectsClick={() => {}}
          onReportsClick={() => {}}
          onSettingsClick={() => {}}
          onScheduleClick={() => {}}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* BeachPark Header */}
          <header className="beachpark-glass border-b border-border/50 px-6 py-4 flex items-center justify-between beachpark-fade-in">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden beachpark-hover-lift"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold beachpark-text-gradient">
                Tô Sabendo - Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="beachpark-hover-lift">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="text-sm text-muted-foreground">
                {user?.name || user?.email}
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6 beachpark-scrollbar">
            <div className="beachpark-slide-up">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
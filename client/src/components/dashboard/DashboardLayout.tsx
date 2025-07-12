import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './sidebar';
import Header from './header';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationsDropdown } from '@/components/ui/notifications-dropdown';
import { UsersModal } from './modals/users-modal';
import { ProjectsModal } from './modals/projects-modal';
import { ReportsModal } from './modals/reports-modal';
import { SettingsModal } from './modals/settings-modal';

interface DashboardLayoutProps {
  children: React.ReactNode;
  dashboardId: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, dashboardId }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [projectsModalOpen, setProjectsModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [activityLogOpen, setActivityLogOpen] = useState(false);

  return (
    <div className="min-h-screen beachpark-gradient-bg">
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          onActivityLogToggle={() => setActivityLogOpen(!activityLogOpen)}
          onUsersClick={() => setUsersModalOpen(true)}
          onProjectsClick={() => setProjectsModalOpen(true)}
          onReportsClick={() => setReportsModalOpen(true)}
          onSettingsClick={() => setSettingsModalOpen(true)}
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
            <div className="flex items-center gap-3">
              <NotificationsDropdown />
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full p-1">
                <ThemeToggle />
              </div>
              <div className="text-sm text-muted-foreground font-medium">
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
      
      {/* Modais */}
      <UsersModal 
        isOpen={usersModalOpen} 
        onClose={() => setUsersModalOpen(false)} 
      />
      <ProjectsModal 
        isOpen={projectsModalOpen} 
        onClose={() => setProjectsModalOpen(false)} 
      />
      <ReportsModal 
        isOpen={reportsModalOpen} 
        onClose={() => setReportsModalOpen(false)} 
      />
      <SettingsModal 
        isOpen={settingsModalOpen} 
        onClose={() => setSettingsModalOpen(false)} 
      />
    </div>
  );
};
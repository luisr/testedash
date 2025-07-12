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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 dashboard-container">
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
          {/* Simplified Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Tô Sabendo - Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="text-sm text-gray-600">
                {user?.name || user?.email}
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
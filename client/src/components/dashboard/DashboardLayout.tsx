import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './sidebar';
import Header from './header';
import { NotificationPopup } from '@/components/notifications/notification-popup';
import { NotificationPreferencesDialog } from '@/components/notifications/notification-preferences-dialog';
import { useNotifications, useWebSocketNotifications } from '@/hooks/use-notifications';

interface DashboardLayoutProps {
  children: React.ReactNode;
  dashboardId: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, dashboardId }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPreferencesOpen, setNotificationPreferencesOpen] = useState(false);
  
  // Notification management
  const { notifications, markAsRead } = useNotifications(user?.id || 0);
  useWebSocketNotifications(user?.id || 0);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 dashboard-container">
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          dashboardId={dashboardId}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
            onNotificationPreferencesClick={() => setNotificationPreferencesOpen(true)}
            unreadCount={unreadNotifications.length}
          />
          
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Notification Popup */}
      <NotificationPopup 
        notifications={unreadNotifications}
        onMarkAsRead={markAsRead}
      />

      {/* Notification Preferences Dialog */}
      <NotificationPreferencesDialog 
        open={notificationPreferencesOpen}
        onOpenChange={setNotificationPreferencesOpen}
        userId={user?.id || 0}
      />
    </div>
  );
};
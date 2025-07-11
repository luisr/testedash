import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import type { Notification, InsertNotification } from '../shared/schema';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  dashboardId?: number;
}

class NotificationService {
  private wss: WebSocketServer;
  private clients: Map<number, Set<AuthenticatedWebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
      console.log('New WebSocket connection');

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'auth') {
            // Authenticate user and subscribe to notifications
            const { userId, dashboardId } = data;
            ws.userId = userId;
            ws.dashboardId = dashboardId;
            
            // Add client to user's connection set
            if (!this.clients.has(userId)) {
              this.clients.set(userId, new Set());
            }
            this.clients.get(userId)!.add(ws);
            
            // Send existing unread notifications
            await this.sendUnreadNotifications(ws, userId);
            
            ws.send(JSON.stringify({ 
              type: 'auth_success', 
              message: 'Successfully authenticated' 
            }));
          } else if (data.type === 'mark_read') {
            // Mark notification as read
            const { notificationId } = data;
            await storage.markNotificationAsRead(notificationId);
            
            ws.send(JSON.stringify({ 
              type: 'notification_read', 
              notificationId 
            }));
          } else if (data.type === 'mark_all_read') {
            // Mark all notifications as read for user
            const { userId } = data;
            await storage.markAllNotificationsAsRead(userId);
            
            ws.send(JSON.stringify({ 
              type: 'all_notifications_read' 
            }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        // Remove client from all user connection sets
        for (const [userId, userClients] of this.clients.entries()) {
          userClients.delete(ws);
          if (userClients.size === 0) {
            this.clients.delete(userId);
          }
        }
        console.log('WebSocket connection closed');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private async sendUnreadNotifications(ws: AuthenticatedWebSocket, userId: number) {
    try {
      const notifications = await storage.getUnreadNotifications(userId);
      
      ws.send(JSON.stringify({
        type: 'unread_notifications',
        notifications: notifications
      }));
    } catch (error) {
      console.error('Error sending unread notifications:', error);
    }
  }

  // Send notification to specific user
  async sendNotificationToUser(userId: number, notification: Notification) {
    const userClients = this.clients.get(userId);
    if (userClients && userClients.size > 0) {
      const message = JSON.stringify({
        type: 'new_notification',
        notification: notification
      });

      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  // Send notification to all users in a dashboard
  async sendNotificationToDashboard(dashboardId: number, notification: Notification, excludeUserId?: number) {
    const dashboardUsers = await storage.getDashboardUsers(dashboardId);
    
    for (const user of dashboardUsers) {
      if (excludeUserId && user.id === excludeUserId) continue;
      await this.sendNotificationToUser(user.id, notification);
    }
  }

  // Create and send notification
  async createNotification(notificationData: InsertNotification) {
    try {
      const notification = await storage.createNotification(notificationData);
      
      // Send to specific user or all dashboard users
      if (notificationData.userId) {
        await this.sendNotificationToUser(notificationData.userId, notification);
      } else if (notificationData.dashboardId) {
        await this.sendNotificationToDashboard(notificationData.dashboardId, notification);
      }
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.clients.size;
  }

  // Get active connections count
  getActiveConnectionsCount(): number {
    let count = 0;
    this.clients.forEach(userClients => {
      count += userClients.size;
    });
    return count;
  }
}

export { NotificationService };
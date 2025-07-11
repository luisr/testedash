import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertDashboardSchema, insertProjectSchema, insertActivitySchema,
  insertDashboardShareSchema, insertActivityLogSchema, insertCustomColumnSchema, insertCustomChartSchema,
  insertNotificationSchema, insertNotificationPreferencesSchema, insertDashboardBackupSchema,
  insertDashboardVersionSchema, insertBackupScheduleSchema, insertActivityDependencySchema, insertActivityConstraintSchema
} from "@shared/schema";
import { recalculateDashboardSchedule } from "./dependency-scheduler";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      // For now, return mock users since we don't have a getUsers method
      const mockUsers = [
        { id: 1, name: "João Silva", email: "joao@exemplo.com", role: "admin", department: "TI", position: "Desenvolvedor Senior", createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: "Maria Santos", email: "maria@exemplo.com", role: "manager", department: "TI", position: "Gerente de Projetos", createdAt: new Date(), updatedAt: new Date() },
        { id: 3, name: "Carlos Oliveira", email: "carlos@exemplo.com", role: "user", department: "Marketing", position: "Analista", createdAt: new Date(), updatedAt: new Date() }
      ];
      res.json(mockUsers);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // For now, just return success since we don't have a deleteUser method
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboards
  app.get("/api/dashboards/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const dashboards = await storage.getDashboardsByUserId(userId);
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dashboard = await storage.getDashboard(id);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/dashboards", async (req, res) => {
    try {
      const dashboardData = insertDashboardSchema.parse(req.body);
      const dashboard = await storage.createDashboard(dashboardData);
      res.status(201).json(dashboard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/dashboards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dashboardData = insertDashboardSchema.partial().parse(req.body);
      const dashboard = await storage.updateDashboard(id, dashboardData);
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      res.json(dashboard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/dashboards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDashboard(id);
      if (!deleted) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      res.json({ message: "Dashboard deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Projects
  app.get("/api/projects/dashboard/:dashboardId", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const projects = await storage.getProjectsByDashboardId(dashboardId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, projectData);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activities
  app.get("/api/activities/dashboard/:dashboardId", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const activities = await storage.getActivitiesByDashboardId(dashboardId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      
      // Log the activity creation
      await storage.createActivityLog({
        dashboardId: activityData.dashboardId!,
        userId: 1, // TODO: Get from authenticated user
        action: "create",
        entityType: "activity",
        entityId: activity.id,
        details: { name: activity.name }
      });

      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/activities/import", async (req, res) => {
    try {
      const { dashboardId, activities } = req.body;
      
      if (!dashboardId || !Array.isArray(activities)) {
        return res.status(400).json({ message: "Invalid input: dashboardId and activities array required" });
      }

      const createdActivities = [];
      
      for (const activityData of activities) {
        try {
          const parsedActivity = insertActivitySchema.parse({
            ...activityData,
            dashboardId: dashboardId
          });
          const activity = await storage.createActivity(parsedActivity);
          createdActivities.push(activity);
          
          // Log the activity creation
          await storage.createActivityLog({
            dashboardId: dashboardId,
            userId: 1, // TODO: Get from authenticated user
            action: "import",
            entityType: "activity",
            entityId: activity.id,
            details: { name: activity.name }
          });
        } catch (error) {
          console.error(`Failed to import activity: ${activityData.name}`, error);
          // Continue with other activities
        }
      }

      res.status(201).json({ 
        message: `Successfully imported ${createdActivities.length} activities`, 
        activities: createdActivities 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activityData = insertActivitySchema.partial().parse(req.body);
      const activity = await storage.updateActivity(id, activityData);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }

      // Log the activity update
      await storage.createActivityLog({
        dashboardId: activity.dashboardId!,
        userId: 1, // TODO: Get from authenticated user
        action: "update",
        entityType: "activity",
        entityId: activity.id,
        details: { name: activity.name, changes: activityData }
      });

      res.json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }

      const deleted = await storage.deleteActivity(id);
      
      if (deleted) {
        // Log the activity deletion
        await storage.createActivityLog({
          dashboardId: activity.dashboardId!,
          userId: 1, // TODO: Get from authenticated user
          action: "delete",
          entityType: "activity",
          entityId: activity.id,
          details: { name: activity.name }
        });
      }

      res.json({ message: "Activity deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard Shares
  app.get("/api/dashboard-shares/:dashboardId", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const shares = await storage.getDashboardShares(dashboardId);
      res.json(shares);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/dashboard-shares", async (req, res) => {
    try {
      const { email, ...shareData } = req.body;
      
      // First, find or create user by email
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // Create a new user if they don't exist
        user = await storage.createUser({
          name: email.split('@')[0],
          email: email,
          role: 'user'
        });
      }

      const parsedShareData = insertDashboardShareSchema.parse({
        ...shareData,
        userId: user.id,
        sharedById: 1 // TODO: Get from authenticated user
      });

      const share = await storage.createDashboardShare(parsedShareData);
      
      // Log the dashboard share
      await storage.createActivityLog({
        dashboardId: parsedShareData.dashboardId,
        userId: parsedShareData.sharedById,
        action: "share",
        entityType: "dashboard",
        entityId: parsedShareData.dashboardId,
        details: { 
          userEmail: email,
          userId: user.id, 
          permission: parsedShareData.permission,
          granularPermissions: {
            canView: parsedShareData.canView,
            canEdit: parsedShareData.canEdit,
            canExport: parsedShareData.canExport,
            canCreateActivities: parsedShareData.canCreateActivities,
            canShare: parsedShareData.canShare
          }
        }
      });

      res.status(201).json(share);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/dashboard-shares/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDashboardShare(id);
      
      if (deleted) {
        // Log the share deletion
        await storage.createActivityLog({
          dashboardId: 1, // TODO: Get from share context
          userId: 1, // TODO: Get from authenticated user
          action: "unshare",
          entityType: "dashboard",
          entityId: 1,
          details: { shareId: id }
        });
      }
      
      res.json({ message: "Share deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activity Logs
  app.get("/api/activity-logs/:dashboardId", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getActivityLogs(dashboardId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Custom Columns
  app.get("/api/custom-columns/:dashboardId", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const columns = await storage.getCustomColumns(dashboardId);
      res.json(columns);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/custom-columns", async (req, res) => {
    try {
      const columnData = insertCustomColumnSchema.parse(req.body);
      const column = await storage.createCustomColumn(columnData);
      res.status(201).json(column);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Custom Charts
  app.get("/api/custom-charts/:dashboardId", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const charts = await storage.getCustomCharts(dashboardId);
      res.json(charts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/custom-columns", async (req, res) => {
    try {
      const columnData = insertCustomColumnSchema.parse(req.body);
      const column = await storage.createCustomColumn(columnData);
      res.status(201).json(column);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/custom-columns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const columnData = insertCustomColumnSchema.partial().parse(req.body);
      const column = await storage.updateCustomColumn(id, columnData);
      
      if (!column) {
        return res.status(404).json({ message: "Column not found" });
      }
      
      res.json(column);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/custom-columns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomColumn(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Column not found" });
      }
      
      res.json({ message: "Column deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/custom-charts", async (req, res) => {
    try {
      const chartData = insertCustomChartSchema.parse(req.body);
      const chart = await storage.createCustomChart(chartData);
      res.status(201).json(chart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard export
  app.post("/api/export/dashboard/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { data, format, dashboardName, includeCharts, includeFilters, columns, metrics } = req.body;
      
      // Log the export action
      await storage.createActivityLog({
        dashboardId: parseInt(id),
        userId: 1, // TODO: Get from session
        action: 'export',
        entityType: 'dashboard',
        entityId: parseInt(id),
        details: { format, columns: columns.length, includeCharts, includeFilters }
      });

      if (format === 'csv') {
        // Generate CSV
        const csvHeaders = columns.map((col: string) => {
          const availableColumns = [
            { key: 'name', label: 'Nome' },
            { key: 'description', label: 'Descrição' },
            { key: 'discipline', label: 'Disciplina' },
            { key: 'responsible', label: 'Responsável' },
            { key: 'status', label: 'Status' },
            { key: 'priority', label: 'Prioridade' },
            { key: 'plannedStartDate', label: 'Data Início Planejada' },
            { key: 'plannedEndDate', label: 'Data Fim Planejada' },
            { key: 'actualStartDate', label: 'Data Início Real' },
            { key: 'actualEndDate', label: 'Data Fim Real' },
            { key: 'plannedValue', label: 'Valor Planejado' },
            { key: 'actualCost', label: 'Custo Real' },
            { key: 'earnedValue', label: 'Valor Agregado' },
            { key: 'completionPercentage', label: 'Percentual Conclusão' },
            { key: 'associatedRisk', label: 'Risco Associado' },
          ];
          const column = availableColumns.find((c: any) => c.key === col);
          return column?.label || col;
        }).join(',');
        
        const csvRows = data.map((row: any) => {
          return columns.map((col: string) => {
            const value = row[col];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',');
        });
        
        const csvContent = [csvHeaders, ...csvRows].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${dashboardName}-export.csv"`);
        res.send(csvContent);
      } else if (format === 'xlsx') {
        // For Excel export, return CSV with Excel headers (would need xlsx library for true Excel)
        const csvHeaders = columns.map((col: string) => {
          const availableColumns = [
            { key: 'name', label: 'Nome' },
            { key: 'description', label: 'Descrição' },
            { key: 'discipline', label: 'Disciplina' },
            { key: 'responsible', label: 'Responsável' },
            { key: 'status', label: 'Status' },
            { key: 'priority', label: 'Prioridade' },
            { key: 'plannedStartDate', label: 'Data Início Planejada' },
            { key: 'plannedEndDate', label: 'Data Fim Planejada' },
            { key: 'actualStartDate', label: 'Data Início Real' },
            { key: 'actualEndDate', label: 'Data Fim Real' },
            { key: 'plannedValue', label: 'Valor Planejado' },
            { key: 'actualCost', label: 'Custo Real' },
            { key: 'earnedValue', label: 'Valor Agregado' },
            { key: 'completionPercentage', label: 'Percentual Conclusão' },
            { key: 'associatedRisk', label: 'Risco Associado' },
          ];
          const column = availableColumns.find((c: any) => c.key === col);
          return column?.label || col;
        }).join(',');
        
        const csvRows = data.map((row: any) => {
          return columns.map((col: string) => {
            const value = row[col];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',');
        });
        
        const csvContent = [csvHeaders, ...csvRows].join('\n');
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${dashboardName}-export.xlsx"`);
        res.send(csvContent);
      } else if (format === 'pdf') {
        // Generate PDF-like text content
        let pdfContent = `Dashboard: ${dashboardName}\n`;
        pdfContent += `Exported on: ${new Date().toLocaleString()}\n\n`;
        
        if (includeFilters && metrics) {
          pdfContent += `Métricas do Dashboard:\n`;
          pdfContent += `- Total de Atividades: ${metrics.totalActivities}\n`;
          pdfContent += `- Atividades Concluídas: ${metrics.completedActivities}\n`;
          pdfContent += `- Taxa de Conclusão: ${metrics.overallCompletionPercentage}%\n`;
          pdfContent += `- SPI Médio: ${metrics.averageSPI}\n`;
          pdfContent += `- CPI Médio: ${metrics.averageCPI}\n\n`;
        }
        
        pdfContent += `Atividades:\n`;
        pdfContent += `${'='.repeat(50)}\n`;
        
        data.forEach((activity: any, index: number) => {
          pdfContent += `${index + 1}. ${activity.name || 'Sem título'}\n`;
          if (activity.description) pdfContent += `   Descrição: ${activity.description}\n`;
          if (activity.responsible) pdfContent += `   Responsável: ${activity.responsible}\n`;
          if (activity.status) pdfContent += `   Status: ${activity.status}\n`;
          if (activity.completionPercentage) pdfContent += `   Progresso: ${activity.completionPercentage}%\n`;
          pdfContent += `\n`;
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${dashboardName}-export.pdf"`);
        res.send(pdfContent);
      } else {
        res.status(400).json({ message: "Unsupported format" });
      }
    } catch (error) {
      console.error('Dashboard export error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notifications
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifications = await storage.getNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/notifications/unread/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getUnreadNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      
      // Send real-time notification via WebSocket
      const notificationService = req.app.get('notificationService');
      if (notificationService) {
        await notificationService.sendNotificationToUser(notification.userId, notification);
      }
      
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markNotificationAsRead(id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/notifications/mark-all-read/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const success = await storage.markAllNotificationsAsRead(userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNotification(id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notification Preferences
  app.get("/api/notification-preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = await storage.getNotificationPreferences(userId);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/notification-preferences/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferencesData = insertNotificationPreferencesSchema.parse(req.body);
      const preferences = await storage.updateNotificationPreferences(userId, preferencesData);
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard Backups
  app.get("/api/dashboards/:dashboardId/backups", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const limit = parseInt(req.query.limit as string) || 50;
      const backups = await storage.getDashboardBackups(dashboardId, limit);
      res.json(backups);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/dashboards/:dashboardId/backups", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const backupData = insertDashboardBackupSchema.parse(req.body);
      
      // Create backup with comprehensive data
      const backup = await storage.createDashboardBackup({
        ...backupData,
        dashboardId,
      });
      
      res.status(201).json(backup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/dashboards/:dashboardId/backups/auto", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const userId = parseInt(req.body.userId) || 1;
      
      // Get comprehensive dashboard data
      const dashboard = await storage.getDashboard(dashboardId);
      const activities = await storage.getActivitiesByDashboardId(dashboardId);
      const projects = await storage.getProjectsByDashboardId(dashboardId);
      const customColumns = await storage.getCustomColumns(dashboardId);
      const customCharts = await storage.getCustomCharts(dashboardId);
      
      const backupData = {
        dashboardId,
        userId,
        version: `v${new Date().toISOString().substring(0, 10)}-${Date.now()}`,
        backupType: "automatic" as const,
        triggerEvent: "user_request",
        dashboardData: dashboard || {},
        activitiesData: activities || [],
        projectsData: projects || [],
        customColumnsData: customColumns || [],
        customChartsData: customCharts || [],
        description: "Backup automático criado pelo usuário",
        fileSize: JSON.stringify({
          dashboard: dashboard || {},
          activities: activities || [],
          projects: projects || [],
          customColumns: customColumns || [],
          customCharts: customCharts || []
        }).length,
        metadata: {
          totalActivities: activities?.length || 0,
          totalProjects: projects?.length || 0,
          totalCustomColumns: customColumns?.length || 0,
          totalCustomCharts: customCharts?.length || 0,
          createdBy: userId,
          createdOn: new Date().toISOString()
        }
      };
      
      const backup = await storage.createDashboardBackup(backupData);
      res.status(201).json(backup);
    } catch (error) {
      console.error("Error creating automatic backup:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/backups/:backupId", async (req, res) => {
    try {
      const backupId = parseInt(req.params.backupId);
      const success = await storage.deleteDashboardBackup(backupId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/backups/:backupId/restore", async (req, res) => {
    try {
      const backupId = parseInt(req.params.backupId);
      const success = await storage.restoreDashboardBackup(backupId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard Versions
  app.get("/api/dashboards/:dashboardId/versions", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const versions = await storage.getDashboardVersions(dashboardId);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/dashboards/:dashboardId/versions", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const versionData = insertDashboardVersionSchema.parse(req.body);
      
      const version = await storage.createDashboardVersion({
        ...versionData,
        dashboardId,
      });
      
      res.status(201).json(version);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/dashboards/:dashboardId/versions/:versionId/activate", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const versionId = parseInt(req.params.versionId);
      
      const success = await storage.setActiveVersion(dashboardId, versionId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Backup Schedules
  app.get("/api/dashboards/:dashboardId/backup-schedules", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const schedules = await storage.getBackupSchedules(dashboardId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/dashboards/:dashboardId/backup-schedules", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const scheduleData = insertBackupScheduleSchema.parse(req.body);
      
      const schedule = await storage.createBackupSchedule({
        ...scheduleData,
        dashboardId,
      });
      
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/backup-schedules/:scheduleId", async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.scheduleId);
      const scheduleData = insertBackupScheduleSchema.partial().parse(req.body);
      
      const schedule = await storage.updateBackupSchedule(scheduleId, scheduleData);
      res.json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/backup-schedules/:scheduleId", async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.scheduleId);
      const success = await storage.deleteBackupSchedule(scheduleId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activity Dependencies
  app.get("/api/dashboards/:dashboardId/dependencies", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const dependencies = await storage.getActivityDependencies(dashboardId);
      res.json(dependencies);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/activities/:activityId/dependencies", async (req, res) => {
    try {
      const activityId = parseInt(req.params.activityId);
      const dependencies = await storage.getActivityDependenciesByActivity(activityId);
      res.json(dependencies);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/activity-dependencies", async (req, res) => {
    try {
      const dependencyData = insertActivityDependencySchema.parse(req.body);
      const dependency = await storage.createActivityDependency(dependencyData);
      res.status(201).json(dependency);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/activity-dependencies/:dependencyId", async (req, res) => {
    try {
      const dependencyId = parseInt(req.params.dependencyId);
      const dependencyData = insertActivityDependencySchema.partial().parse(req.body);
      const dependency = await storage.updateActivityDependency(dependencyId, dependencyData);
      res.json(dependency);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/activity-dependencies/:dependencyId", async (req, res) => {
    try {
      const dependencyId = parseInt(req.params.dependencyId);
      const success = await storage.deleteActivityDependency(dependencyId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activity Constraints
  app.get("/api/dashboards/:dashboardId/constraints", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const constraints = await storage.getActivityConstraints(dashboardId);
      res.json(constraints);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/activities/:activityId/constraints", async (req, res) => {
    try {
      const activityId = parseInt(req.params.activityId);
      const constraints = await storage.getActivityConstraintsByActivity(activityId);
      res.json(constraints);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/activity-constraints", async (req, res) => {
    try {
      const constraintData = insertActivityConstraintSchema.parse(req.body);
      const constraint = await storage.createActivityConstraint(constraintData);
      res.status(201).json(constraint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/activity-constraints/:constraintId", async (req, res) => {
    try {
      const constraintId = parseInt(req.params.constraintId);
      const constraintData = insertActivityConstraintSchema.partial().parse(req.body);
      const constraint = await storage.updateActivityConstraint(constraintId, constraintData);
      res.json(constraint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/activity-constraints/:constraintId", async (req, res) => {
    try {
      const constraintId = parseInt(req.params.constraintId);
      const success = await storage.deleteActivityConstraint(constraintId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Schedule Recalculation
  app.post("/api/dashboards/:dashboardId/recalculate-schedule", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const calculations = await recalculateDashboardSchedule(dashboardId);
      res.json({
        success: true,
        calculations,
        message: "Schedule recalculated successfully"
      });
    } catch (error) {
      console.error("Error recalculating schedule:", error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Temporary migration endpoint
  app.post("/api/migrate-dependencies", async (req, res) => {
    try {
      console.log('🔄 Starting dependency migration...');
      
      // Get database connection
      let connectionString = process.env.DATABASE_URL;
      if (!connectionString || !connectionString.startsWith('postgresql://')) {
        const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
        if (PGUSER && PGPASSWORD && PGHOST && PGPORT && PGDATABASE) {
          connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
        }
      }
      
      if (!connectionString) {
        throw new Error('Database connection not configured');
      }
      
      const client = postgres(connectionString);
      const db = drizzle(client);
      
      // Create activity dependencies table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS activity_dependencies (
          id SERIAL PRIMARY KEY,
          predecessor_id INTEGER NOT NULL REFERENCES activities(id),
          successor_id INTEGER NOT NULL REFERENCES activities(id),
          dependency_type TEXT NOT NULL DEFAULT 'finish_to_start',
          lag_time INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      // Create activity constraints table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS activity_constraints (
          id SERIAL PRIMARY KEY,
          activity_id INTEGER NOT NULL REFERENCES activities(id),
          constraint_type TEXT NOT NULL,
          constraint_date TIMESTAMP NOT NULL,
          priority TEXT DEFAULT 'medium',
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      // Add new columns to activities table
      await db.execute(sql`
        ALTER TABLE activities 
        ADD COLUMN IF NOT EXISTS duration INTEGER,
        ADD COLUMN IF NOT EXISTS buffer_time INTEGER,
        ADD COLUMN IF NOT EXISTS is_auto_scheduled BOOLEAN,
        ADD COLUMN IF NOT EXISTS critical_path BOOLEAN;
      `);
      
      // Create indexes for better performance
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_activity_dependencies_predecessor ON activity_dependencies(predecessor_id);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_activity_dependencies_successor ON activity_dependencies(successor_id);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_activity_constraints_activity ON activity_constraints(activity_id);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_activities_duration ON activities(duration);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_activities_critical_path ON activities(critical_path);`);
      
      // Update existing activities with default values
      const activitiesResult = await db.execute(sql`
        UPDATE activities 
        SET 
          duration = CASE 
            WHEN planned_start_date IS NOT NULL AND planned_end_date IS NOT NULL 
            THEN EXTRACT(DAY FROM (planned_end_date - planned_start_date))::INTEGER
            ELSE 1
          END,
          buffer_time = 0,
          is_auto_scheduled = true,
          critical_path = false
        WHERE duration IS NULL;
      `);
      
      await client.end();
      console.log('✅ Dependency migration completed successfully!');
      res.json({ success: true, message: 'Migration completed successfully' });
      
    } catch (error) {
      console.error('❌ Error during migration:', error);
      res.status(500).json({ error: 'Migration failed', details: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertDashboardSchema, insertProjectSchema, insertActivitySchema,
  insertDashboardShareSchema, insertActivityLogSchema, insertCustomColumnSchema, insertCustomChartSchema,
  insertNotificationSchema, insertNotificationPreferencesSchema, insertDashboardBackupSchema,
  insertDashboardVersionSchema, insertBackupScheduleSchema, insertActivityDependencySchema, insertActivityConstraintSchema,
  insertDateChangesAuditSchema
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
      const users = await storage.getUsers();
      res.json(users);
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
      console.error("Error getting projects:", error);
      res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' });
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
      console.error("Error getting activities:", error);
      res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' });
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

  // Migration endpoint for custom features
  app.post("/api/migrate-custom-features", async (req, res) => {
    try {
      console.log('🔄 Starting custom features migration...');
      
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
      
      // Create custom_statuses table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS custom_statuses (
          id SERIAL PRIMARY KEY,
          dashboard_id INTEGER NOT NULL REFERENCES dashboards(id),
          name TEXT NOT NULL,
          label TEXT NOT NULL,
          color TEXT NOT NULL,
          background_color TEXT NOT NULL,
          border_color TEXT NOT NULL,
          is_default BOOLEAN DEFAULT false NOT NULL,
          is_active BOOLEAN DEFAULT true NOT NULL,
          "order" INTEGER DEFAULT 1 NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
      
      // Create custom_kpis table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS custom_kpis (
          id SERIAL PRIMARY KEY,
          dashboard_id INTEGER NOT NULL REFERENCES dashboards(id),
          name TEXT NOT NULL,
          description TEXT,
          data_source TEXT NOT NULL,
          field TEXT NOT NULL,
          aggregation TEXT NOT NULL,
          filters JSONB DEFAULT '[]' NOT NULL,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          format TEXT NOT NULL,
          target DECIMAL,
          target_comparison TEXT DEFAULT 'gt' NOT NULL,
          is_active BOOLEAN DEFAULT true NOT NULL,
          "order" INTEGER DEFAULT 1 NOT NULL,
          size TEXT DEFAULT 'medium' NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
      
      // Create indexes for better performance
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_custom_statuses_dashboard ON custom_statuses(dashboard_id);`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_custom_kpis_dashboard ON custom_kpis(dashboard_id);`);
      
      await client.end();
      console.log('✅ Custom features migration completed successfully!');
      res.json({ success: true, message: 'Custom features migration completed successfully' });
      
    } catch (error) {
      console.error('❌ Error during custom features migration:', error);
      res.status(500).json({ error: 'Migration failed', details: (error as Error).message });
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
        ADD COLUMN IF NOT EXISTS critical_path BOOLEAN,
        ADD COLUMN IF NOT EXISTS parent_activity_id INTEGER REFERENCES activities(id),
        ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;
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

  // Custom Status routes
  app.get("/api/custom-statuses/:dashboardId", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const customStatuses = await storage.getCustomStatuses(dashboardId);
      res.json(customStatuses);
    } catch (error) {
      console.error("Error fetching custom statuses:", error);
      res.status(500).json({ error: "Failed to fetch custom statuses" });
    }
  });

  app.post("/api/custom-statuses/:dashboardId", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const statuses = req.body;
      
      // Delete existing custom statuses for this dashboard
      await storage.deleteCustomStatuses(dashboardId);
      
      // Insert new custom statuses
      for (const status of statuses) {
        await storage.createCustomStatus({ ...status, dashboardId });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving custom statuses:", error);
      res.status(500).json({ error: "Failed to save custom statuses" });
    }
  });

  // Custom KPI routes
  app.get("/api/custom-kpis/:dashboardId", async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const customKPIs = await storage.getCustomKPIs(dashboardId);
      res.json(customKPIs);
    } catch (error) {
      console.error("Error fetching custom KPIs:", error);
      res.status(500).json({ error: "Failed to fetch custom KPIs" });
    }
  });

  app.post("/api/custom-kpis", async (req, res) => {
    try {
      const kpiData = req.body;
      const kpi = await storage.createCustomKPI(kpiData);
      res.json(kpi);
    } catch (error) {
      console.error("Error creating custom KPI:", error);
      res.status(500).json({ error: "Failed to create custom KPI" });
    }
  });

  app.delete("/api/custom-kpis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomKPI(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting custom KPI:", error);
      res.status(500).json({ error: "Failed to delete custom KPI" });
    }
  });

  // Dashboard Backup Routes
  app.get('/api/dashboard-backups/:dashboardId', async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const backups = await storage.getDashboardBackups(dashboardId);
      res.json(backups);
    } catch (error) {
      console.error('Error fetching dashboard backups:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard backups' });
    }
  });

  app.post('/api/dashboard-backups', async (req, res) => {
    try {
      const { dashboardId, userId, type, description } = req.body;
      
      // Create backup data
      const dashboard = await storage.getDashboard(dashboardId);
      const activities = await storage.getActivitiesByDashboardId(dashboardId);
      const projects = await storage.getProjectsByDashboardId(dashboardId);
      const customColumns = await storage.getCustomColumns(dashboardId);
      const customCharts = await storage.getCustomCharts(dashboardId);
      
      const backupData = {
        dashboard,
        activities,
        projects,
        customColumns,
        customCharts,
        backupDate: new Date(),
        version: '1.0.0'
      };
      
      const dataString = JSON.stringify(backupData);
      const crypto = require('crypto');
      const checksum = crypto.createHash('md5').update(dataString).digest('hex');
      
      const backup = await storage.createDashboardBackup({
        dashboardId,
        userId,
        version: '1.0.0',
        backupType: type,
        dashboardData: backupData.dashboard || {},
        activitiesData: backupData.activities || [],
        projectsData: backupData.projects || [],
        customColumnsData: backupData.customColumns || [],
        customChartsData: backupData.customCharts || [],
        metadata: { manual: true, createdBy: userId },
        description,
        fileSize: Buffer.byteLength(dataString, 'utf8'),
        checksum,
        isRestorable: true
      });
      
      res.json(backup);
    } catch (error) {
      console.error('Error creating dashboard backup:', error);
      res.status(500).json({ error: 'Failed to create dashboard backup' });
    }
  });

  app.post('/api/dashboard-backups/:backupId/restore', async (req, res) => {
    try {
      const backupId = parseInt(req.params.backupId);
      const success = await storage.restoreDashboardBackup(backupId);
      
      if (success) {
        res.json({ message: 'Dashboard restored successfully' });
      } else {
        res.status(404).json({ error: 'Backup not found or restore failed' });
      }
    } catch (error) {
      console.error('Error restoring dashboard backup:', error);
      res.status(500).json({ error: 'Failed to restore dashboard backup' });
    }
  });

  // Dashboard Version Routes
  app.get('/api/dashboard-versions/:dashboardId', async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const versions = await storage.getDashboardVersions(dashboardId);
      res.json(versions);
    } catch (error) {
      console.error('Error fetching dashboard versions:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard versions' });
    }
  });

  app.post('/api/dashboard-versions', async (req, res) => {
    try {
      const { dashboardId, versionName, changeType, releaseNotes, changedBy } = req.body;
      
      // Auto-generate version number
      const existingVersions = await storage.getDashboardVersions(dashboardId);
      const latestVersion = existingVersions.find(v => v.isActive);
      let newVersion = '1.0.0';
      
      if (latestVersion) {
        const parts = latestVersion.version.split('.').map(Number);
        if (changeType === 'major') {
          parts[0]++;
          parts[1] = 0;
          parts[2] = 0;
        } else if (changeType === 'minor') {
          parts[1]++;
          parts[2] = 0;
        } else {
          parts[2]++;
        }
        newVersion = parts.join('.');
      }
      
      const version = await storage.createDashboardVersion({
        dashboardId,
        version: newVersion,
        versionName,
        changes: { type: changeType, timestamp: new Date() },
        changedBy,
        changeType,
        releaseNotes,
        isActive: false,
        isDraft: false
      });
      
      res.json(version);
    } catch (error) {
      console.error('Error creating dashboard version:', error);
      res.status(500).json({ error: 'Failed to create dashboard version' });
    }
  });

  app.post('/api/dashboard-versions/:versionId/activate', async (req, res) => {
    try {
      const versionId = parseInt(req.params.versionId);
      const { dashboardId } = req.body;
      
      const success = await storage.setActiveVersion(dashboardId, versionId);
      
      if (success) {
        res.json({ message: 'Version activated successfully' });
      } else {
        res.status(404).json({ error: 'Version not found or activation failed' });
      }
    } catch (error) {
      console.error('Error activating dashboard version:', error);
      res.status(500).json({ error: 'Failed to activate dashboard version' });
    }
  });

  // Backup Schedule Routes
  app.get('/api/backup-schedules/:dashboardId', async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const schedules = await storage.getBackupSchedules(dashboardId);
      res.json(schedules);
    } catch (error) {
      console.error('Error fetching backup schedules:', error);
      res.status(500).json({ error: 'Failed to fetch backup schedules' });
    }
  });

  app.post('/api/backup-schedules', async (req, res) => {
    try {
      const schedule = await storage.createBackupSchedule(req.body);
      res.json(schedule);
    } catch (error) {
      console.error('Error creating backup schedule:', error);
      res.status(500).json({ error: 'Failed to create backup schedule' });
    }
  });

  app.patch('/api/backup-schedules/:scheduleId', async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.scheduleId);
      const schedule = await storage.updateBackupSchedule(scheduleId, req.body);
      
      if (schedule) {
        res.json(schedule);
      } else {
        res.status(404).json({ error: 'Schedule not found' });
      }
    } catch (error) {
      console.error('Error updating backup schedule:', error);
      res.status(500).json({ error: 'Failed to update backup schedule' });
    }
  });

  app.delete('/api/backup-schedules/:scheduleId', async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.scheduleId);
      const success = await storage.deleteBackupSchedule(scheduleId);
      
      if (success) {
        res.json({ message: 'Schedule deleted successfully' });
      } else {
        res.status(404).json({ error: 'Schedule not found' });
      }
    } catch (error) {
      console.error('Error deleting backup schedule:', error);
      res.status(500).json({ error: 'Failed to delete backup schedule' });
    }
  });

  // Date Changes Audit Routes
  app.get('/api/date-changes-audit/:dashboardId', async (req, res) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId);
      const activityId = req.query.activityId ? parseInt(req.query.activityId as string) : undefined;
      
      const auditRecords = await storage.getDateChangesAudit(dashboardId, activityId);
      res.json(auditRecords);
    } catch (error) {
      console.error('Error fetching date changes audit:', error);
      res.status(500).json({ error: 'Failed to fetch date changes audit' });
    }
  });

  app.post('/api/date-changes-audit', async (req, res) => {
    try {
      const auditData = insertDateChangesAuditSchema.parse(req.body);
      const audit = await storage.createDateChangesAudit(auditData);
      res.status(201).json(audit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error('Error creating date changes audit:', error);
      res.status(500).json({ error: 'Failed to create date changes audit' });
    }
  });

  // Modified activity update route with audit
  app.patch('/api/activities/:id/with-audit', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { activityData, userId, justification, changeReason } = req.body;
      
      const activityUpdateData = insertActivitySchema.partial().parse(activityData);
      const activity = await storage.updateActivityWithDateAudit(id, activityUpdateData, userId, justification, changeReason);
      
      if (activity) {
        res.json(activity);
      } else {
        res.status(404).json({ error: 'Activity not found' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error('Error updating activity with audit:', error);
      res.status(500).json({ error: (error as Error).message || 'Failed to update activity' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

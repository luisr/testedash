import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertDashboardSchema, insertProjectSchema, insertActivitySchema,
  insertDashboardShareSchema, insertActivityLogSchema, insertCustomColumnSchema, insertCustomChartSchema
} from "@shared/schema";
import { z } from "zod";

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
      const shareData = insertDashboardShareSchema.parse(req.body);
      const share = await storage.createDashboardShare(shareData);
      
      // Log the dashboard share
      await storage.createActivityLog({
        dashboardId: shareData.dashboardId,
        userId: shareData.sharedById,
        action: "share",
        entityType: "dashboard",
        entityId: shareData.dashboardId,
        details: { userId: shareData.userId, permission: shareData.permission }
      });

      res.status(201).json(share);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
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

  const httpServer = createServer(app);
  return httpServer;
}

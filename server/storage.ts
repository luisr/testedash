import { eq, desc, and, or, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users, dashboards, projects, activities, dashboardShares, activityLogs, customColumns, customCharts,
  type User, type InsertUser, type Dashboard, type InsertDashboard, type Project, type InsertProject,
  type Activity, type InsertActivity, type DashboardShare, type InsertDashboardShare,
  type ActivityLog, type InsertActivityLog, type CustomColumn, type InsertCustomColumn,
  type CustomChart, type InsertCustomChart
} from "@shared/schema";

// Check if DATABASE_URL is properly configured
const connectionString = process.env.DATABASE_URL;
let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (connectionString && connectionString.startsWith('postgresql://')) {
  try {
    client = postgres(connectionString);
    db = drizzle(client);
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }
} else {
  console.warn('DATABASE_URL not properly configured. Using mock data for development.');
}

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Dashboards
  getDashboard(id: number): Promise<Dashboard | undefined>;
  getDashboardsByUserId(userId: number): Promise<Dashboard[]>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: number, dashboard: Partial<InsertDashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: number): Promise<boolean>;

  // Projects
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByDashboardId(dashboardId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Activities
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByDashboardId(dashboardId: number): Promise<Activity[]>;
  getActivitiesByProjectId(projectId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;

  // Dashboard Shares
  getDashboardShares(dashboardId: number): Promise<DashboardShare[]>;
  createDashboardShare(share: InsertDashboardShare): Promise<DashboardShare>;
  deleteDashboardShare(id: number): Promise<boolean>;

  // Activity Logs
  getActivityLogs(dashboardId: number, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Custom Columns
  getCustomColumns(dashboardId: number): Promise<CustomColumn[]>;
  createCustomColumn(column: InsertCustomColumn): Promise<CustomColumn>;
  updateCustomColumn(id: number, column: Partial<InsertCustomColumn>): Promise<CustomColumn | undefined>;
  deleteCustomColumn(id: number): Promise<boolean>;

  // Custom Charts
  getCustomCharts(dashboardId: number): Promise<CustomChart[]>;
  createCustomChart(chart: InsertCustomChart): Promise<CustomChart>;
  updateCustomChart(id: number, chart: Partial<InsertCustomChart>): Promise<CustomChart | undefined>;
  deleteCustomChart(id: number): Promise<boolean>;
}

// Mock data for development
const mockUsers: User[] = [
  { id: 1, email: 'admin@example.com', name: 'João Silva', avatar: null, role: 'admin', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, email: 'user@example.com', name: 'Maria Santos', avatar: null, role: 'user', createdAt: new Date(), updatedAt: new Date() }
];

const mockDashboards: Dashboard[] = [
  { id: 1, name: 'Dashboard Principal', description: 'Dashboard de acompanhamento de projetos', ownerId: 1, isPublic: false, theme: 'light', settings: {}, createdAt: new Date(), updatedAt: new Date() }
];

const mockProjects: Project[] = [
  { id: 1, name: 'Projeto Alpha', description: 'Projeto de desenvolvimento de software', dashboardId: 1, status: 'active', budget: '100000', actualCost: '75000', startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), createdAt: new Date(), updatedAt: new Date() }
];

const mockActivities: Activity[] = [
  { id: 1, name: 'Análise de Requisitos', description: 'Levantamento e análise dos requisitos do projeto', projectId: 1, dashboardId: 1, discipline: 'Análise', responsible: 'João Silva', priority: 'high', status: 'completed', plannedStartDate: new Date('2024-01-01'), plannedEndDate: new Date('2024-01-15'), actualStartDate: new Date('2024-01-01'), actualEndDate: new Date('2024-01-14'), baselineStartDate: new Date('2024-01-01'), baselineEndDate: new Date('2024-01-15'), plannedValue: '10000', actualCost: '9500', earnedValue: '10000', completionPercentage: '100', associatedRisk: 'baixo', requiredResources: ['Analista Senior'], dependencies: [], documentLink: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'Desenvolvimento Frontend', description: 'Implementação da interface do usuário', projectId: 1, dashboardId: 1, discipline: 'Desenvolvimento', responsible: 'Maria Santos', priority: 'medium', status: 'in_progress', plannedStartDate: new Date('2024-01-15'), plannedEndDate: new Date('2024-03-15'), actualStartDate: new Date('2024-01-16'), actualEndDate: null, baselineStartDate: new Date('2024-01-15'), baselineEndDate: new Date('2024-03-15'), plannedValue: '25000', actualCost: '18000', earnedValue: '15000', completionPercentage: '60', associatedRisk: 'médio', requiredResources: ['Desenvolvedor Frontend'], dependencies: ['Análise de Requisitos'], documentLink: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: 'Desenvolvimento Backend', description: 'Implementação da API e lógica de negócio', projectId: 1, dashboardId: 1, discipline: 'Desenvolvimento', responsible: 'Pedro Costa', priority: 'high', status: 'in_progress', plannedStartDate: new Date('2024-01-20'), plannedEndDate: new Date('2024-04-20'), actualStartDate: new Date('2024-01-22'), actualEndDate: null, baselineStartDate: new Date('2024-01-20'), baselineEndDate: new Date('2024-04-20'), plannedValue: '30000', actualCost: '12000', earnedValue: '9000', completionPercentage: '30', associatedRisk: 'alto', requiredResources: ['Desenvolvedor Backend'], dependencies: ['Análise de Requisitos'], documentLink: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: 'Testes de Integração', description: 'Testes de integração entre frontend e backend', projectId: 1, dashboardId: 1, discipline: 'Qualidade', responsible: 'Ana Lima', priority: 'medium', status: 'not_started', plannedStartDate: new Date('2024-04-01'), plannedEndDate: new Date('2024-05-01'), actualStartDate: null, actualEndDate: null, baselineStartDate: new Date('2024-04-01'), baselineEndDate: new Date('2024-05-01'), plannedValue: '15000', actualCost: '0', earnedValue: '0', completionPercentage: '0', associatedRisk: 'baixo', requiredResources: ['Testador QA'], dependencies: ['Desenvolvimento Frontend', 'Desenvolvimento Backend'], documentLink: null, createdAt: new Date(), updatedAt: new Date() }
];

const mockActivityLogs: ActivityLog[] = [
  { id: 1, dashboardId: 1, userId: 1, action: 'create', entityType: 'activity', entityId: 1, details: { name: 'Análise de Requisitos' }, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: 2, dashboardId: 1, userId: 1, action: 'update', entityType: 'activity', entityId: 2, details: { name: 'Desenvolvimento Frontend', changes: { completionPercentage: '60' } }, timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 3, dashboardId: 1, userId: 2, action: 'create', entityType: 'activity', entityId: 3, details: { name: 'Desenvolvimento Backend' }, timestamp: new Date(Date.now() - 1000 * 60 * 60) }
];

const mockCustomColumns: CustomColumn[] = [];
const mockCustomCharts: CustomChart[] = [];
const mockDashboardShares: DashboardShare[] = [];

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    if (db) {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    }
    return mockUsers.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (db) {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result[0];
    }
    return mockUsers.find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    if (db) {
      const result = await db.insert(users).values(user).returning();
      return result[0];
    }
    const newUser: User = {
      id: mockUsers.length + 1,
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUsers.push(newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    if (db) {
      const result = await db.update(users).set({ ...user, updatedAt: new Date() }).where(eq(users.id, id)).returning();
      return result[0];
    }
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex >= 0) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...user, updatedAt: new Date() };
      return mockUsers[userIndex];
    }
    return undefined;
  }

  // Dashboards
  async getDashboard(id: number): Promise<Dashboard | undefined> {
    if (db) {
      const result = await db.select().from(dashboards).where(eq(dashboards.id, id));
      return result[0];
    }
    return mockDashboards.find(d => d.id === id);
  }

  async getDashboardsByUserId(userId: number): Promise<Dashboard[]> {
    if (db) {
      const result = await db.select().from(dashboards)
        .leftJoin(dashboardShares, eq(dashboards.id, dashboardShares.dashboardId))
        .where(or(eq(dashboards.ownerId, userId), eq(dashboardShares.userId, userId)));
      return result.map(r => r.dashboards);
    }
    return mockDashboards.filter(d => d.ownerId === userId);
  }

  async createDashboard(dashboard: InsertDashboard): Promise<Dashboard> {
    if (db) {
      const result = await db.insert(dashboards).values(dashboard).returning();
      return result[0];
    }
    const newDashboard: Dashboard = {
      id: mockDashboards.length + 1,
      ...dashboard,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDashboards.push(newDashboard);
    return newDashboard;
  }

  async updateDashboard(id: number, dashboard: Partial<InsertDashboard>): Promise<Dashboard | undefined> {
    if (db) {
      const result = await db.update(dashboards).set({ ...dashboard, updatedAt: new Date() }).where(eq(dashboards.id, id)).returning();
      return result[0];
    }
    const dashboardIndex = mockDashboards.findIndex(d => d.id === id);
    if (dashboardIndex >= 0) {
      mockDashboards[dashboardIndex] = { ...mockDashboards[dashboardIndex], ...dashboard, updatedAt: new Date() };
      return mockDashboards[dashboardIndex];
    }
    return undefined;
  }

  async deleteDashboard(id: number): Promise<boolean> {
    if (db) {
      const result = await db.delete(dashboards).where(eq(dashboards.id, id));
      return result.count > 0;
    }
    const dashboardIndex = mockDashboards.findIndex(d => d.id === id);
    if (dashboardIndex >= 0) {
      mockDashboards.splice(dashboardIndex, 1);
      return true;
    }
    return false;
  }

  // Projects
  async getProject(id: number): Promise<Project | undefined> {
    if (db) {
      const result = await db.select().from(projects).where(eq(projects.id, id));
      return result[0];
    }
    return mockProjects.find(p => p.id === id);
  }

  async getProjectsByDashboardId(dashboardId: number): Promise<Project[]> {
    if (db) {
      return await db.select().from(projects).where(eq(projects.dashboardId, dashboardId));
    }
    return mockProjects.filter(p => p.dashboardId === dashboardId);
  }

  async createProject(project: InsertProject): Promise<Project> {
    if (db) {
      const result = await db.insert(projects).values(project).returning();
      return result[0];
    }
    const newProject: Project = {
      id: mockProjects.length + 1,
      ...project,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockProjects.push(newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    if (db) {
      const result = await db.update(projects).set({ ...project, updatedAt: new Date() }).where(eq(projects.id, id)).returning();
      return result[0];
    }
    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex >= 0) {
      mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...project, updatedAt: new Date() };
      return mockProjects[projectIndex];
    }
    return undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    if (db) {
      const result = await db.delete(projects).where(eq(projects.id, id));
      return result.count > 0;
    }
    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex >= 0) {
      mockProjects.splice(projectIndex, 1);
      return true;
    }
    return false;
  }

  // Activities
  async getActivity(id: number): Promise<Activity | undefined> {
    if (db) {
      const result = await db.select().from(activities).where(eq(activities.id, id));
      return result[0];
    }
    return mockActivities.find(a => a.id === id);
  }

  async getActivitiesByDashboardId(dashboardId: number): Promise<Activity[]> {
    if (db) {
      return await db.select().from(activities).where(eq(activities.dashboardId, dashboardId));
    }
    return mockActivities.filter(a => a.dashboardId === dashboardId);
  }

  async getActivitiesByProjectId(projectId: number): Promise<Activity[]> {
    if (db) {
      return await db.select().from(activities).where(eq(activities.projectId, projectId));
    }
    return mockActivities.filter(a => a.projectId === projectId);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    if (db) {
      const result = await db.insert(activities).values(activity).returning();
      return result[0];
    }
    const newActivity: Activity = {
      id: mockActivities.length + 1,
      ...activity,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockActivities.push(newActivity);
    return newActivity;
  }

  async updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined> {
    if (db) {
      const result = await db.update(activities).set({ ...activity, updatedAt: new Date() }).where(eq(activities.id, id)).returning();
      return result[0];
    }
    const activityIndex = mockActivities.findIndex(a => a.id === id);
    if (activityIndex >= 0) {
      mockActivities[activityIndex] = { ...mockActivities[activityIndex], ...activity, updatedAt: new Date() };
      return mockActivities[activityIndex];
    }
    return undefined;
  }

  async deleteActivity(id: number): Promise<boolean> {
    if (db) {
      const result = await db.delete(activities).where(eq(activities.id, id));
      return result.count > 0;
    }
    const activityIndex = mockActivities.findIndex(a => a.id === id);
    if (activityIndex >= 0) {
      mockActivities.splice(activityIndex, 1);
      return true;
    }
    return false;
  }

  // Dashboard Shares
  async getDashboardShares(dashboardId: number): Promise<DashboardShare[]> {
    if (db) {
      return await db.select().from(dashboardShares).where(eq(dashboardShares.dashboardId, dashboardId));
    }
    return mockDashboardShares.filter(s => s.dashboardId === dashboardId);
  }

  async createDashboardShare(share: InsertDashboardShare): Promise<DashboardShare> {
    if (db) {
      const result = await db.insert(dashboardShares).values(share).returning();
      return result[0];
    }
    const newShare: DashboardShare = {
      id: mockDashboardShares.length + 1,
      ...share,
      createdAt: new Date()
    };
    mockDashboardShares.push(newShare);
    return newShare;
  }

  async deleteDashboardShare(id: number): Promise<boolean> {
    if (db) {
      const result = await db.delete(dashboardShares).where(eq(dashboardShares.id, id));
      return result.count > 0;
    }
    const shareIndex = mockDashboardShares.findIndex(s => s.id === id);
    if (shareIndex >= 0) {
      mockDashboardShares.splice(shareIndex, 1);
      return true;
    }
    return false;
  }

  // Activity Logs
  async getActivityLogs(dashboardId: number, limit: number = 50): Promise<ActivityLog[]> {
    if (db) {
      return await db.select().from(activityLogs)
        .where(eq(activityLogs.dashboardId, dashboardId))
        .orderBy(desc(activityLogs.timestamp))
        .limit(limit);
    }
    return mockActivityLogs
      .filter(log => log.dashboardId === dashboardId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    if (db) {
      const result = await db.insert(activityLogs).values(log).returning();
      return result[0];
    }
    const newLog: ActivityLog = {
      id: mockActivityLogs.length + 1,
      ...log,
      timestamp: new Date()
    };
    mockActivityLogs.push(newLog);
    return newLog;
  }

  // Custom Columns
  async getCustomColumns(dashboardId: number): Promise<CustomColumn[]> {
    if (db) {
      return await db.select().from(customColumns).where(eq(customColumns.dashboardId, dashboardId));
    }
    return mockCustomColumns.filter(c => c.dashboardId === dashboardId);
  }

  async createCustomColumn(column: InsertCustomColumn): Promise<CustomColumn> {
    if (db) {
      const result = await db.insert(customColumns).values(column).returning();
      return result[0];
    }
    const newColumn: CustomColumn = {
      id: mockCustomColumns.length + 1,
      ...column,
      createdAt: new Date()
    };
    mockCustomColumns.push(newColumn);
    return newColumn;
  }

  async updateCustomColumn(id: number, column: Partial<InsertCustomColumn>): Promise<CustomColumn | undefined> {
    if (db) {
      const result = await db.update(customColumns).set(column).where(eq(customColumns.id, id)).returning();
      return result[0];
    }
    const columnIndex = mockCustomColumns.findIndex(c => c.id === id);
    if (columnIndex >= 0) {
      mockCustomColumns[columnIndex] = { ...mockCustomColumns[columnIndex], ...column };
      return mockCustomColumns[columnIndex];
    }
    return undefined;
  }

  async deleteCustomColumn(id: number): Promise<boolean> {
    if (db) {
      const result = await db.delete(customColumns).where(eq(customColumns.id, id));
      return result.count > 0;
    }
    const columnIndex = mockCustomColumns.findIndex(c => c.id === id);
    if (columnIndex >= 0) {
      mockCustomColumns.splice(columnIndex, 1);
      return true;
    }
    return false;
  }

  // Custom Charts
  async getCustomCharts(dashboardId: number): Promise<CustomChart[]> {
    if (db) {
      return await db.select().from(customCharts).where(eq(customCharts.dashboardId, dashboardId));
    }
    return mockCustomCharts.filter(c => c.dashboardId === dashboardId);
  }

  async createCustomChart(chart: InsertCustomChart): Promise<CustomChart> {
    if (db) {
      const result = await db.insert(customCharts).values(chart).returning();
      return result[0];
    }
    const newChart: CustomChart = {
      id: mockCustomCharts.length + 1,
      ...chart,
      createdAt: new Date()
    };
    mockCustomCharts.push(newChart);
    return newChart;
  }

  async updateCustomChart(id: number, chart: Partial<InsertCustomChart>): Promise<CustomChart | undefined> {
    if (db) {
      const result = await db.update(customCharts).set(chart).where(eq(customCharts.id, id)).returning();
      return result[0];
    }
    const chartIndex = mockCustomCharts.findIndex(c => c.id === id);
    if (chartIndex >= 0) {
      mockCustomCharts[chartIndex] = { ...mockCustomCharts[chartIndex], ...chart };
      return mockCustomCharts[chartIndex];
    }
    return undefined;
  }

  async deleteCustomChart(id: number): Promise<boolean> {
    if (db) {
      const result = await db.delete(customCharts).where(eq(customCharts.id, id));
      return result.count > 0;
    }
    const chartIndex = mockCustomCharts.findIndex(c => c.id === id);
    if (chartIndex >= 0) {
      mockCustomCharts.splice(chartIndex, 1);
      return true;
    }
    return false;
  }
}

export const storage = new DatabaseStorage();

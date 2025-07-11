import { eq, desc, and, or, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users, dashboards, projects, activities, dashboardShares, activityLogs, customColumns, customCharts,
  notifications, notificationPreferences, dashboardBackups, dashboardVersions, backupSchedules,
  activityDependencies, activityConstraints,
  type User, type InsertUser, type Dashboard, type InsertDashboard, type Project, type InsertProject,
  type Activity, type InsertActivity, type DashboardShare, type InsertDashboardShare,
  type ActivityLog, type InsertActivityLog, type CustomColumn, type InsertCustomColumn,
  type CustomChart, type InsertCustomChart, type Notification, type InsertNotification,
  type NotificationPreferences, type InsertNotificationPreferences,
  type DashboardBackup, type InsertDashboardBackup, type DashboardVersion, type InsertDashboardVersion,
  type BackupSchedule, type InsertBackupSchedule, type ActivityDependency, type InsertActivityDependency,
  type ActivityConstraint, type InsertActivityConstraint
} from "@shared/schema";

// Check if DATABASE_URL is properly configured or build from individual components
let connectionString = process.env.DATABASE_URL;

// If DATABASE_URL is not set or invalid, try to build it from individual components
if (!connectionString || !connectionString.startsWith('postgresql://')) {
  const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
  if (PGUSER && PGPASSWORD && PGHOST && PGPORT && PGDATABASE) {
    connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
    console.log('Built DATABASE_URL from individual components');
  }
}

let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (connectionString && connectionString.startsWith('postgresql://')) {
  try {
    client = postgres(connectionString);
    db = drizzle(client);
    console.log('✅ Database connected successfully');
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

  // Notifications
  getNotifications(userId: number, limit?: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Notification Preferences
  getNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined>;
  updateNotificationPreferences(userId: number, preferences: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences | undefined>;
  
  // Dashboard Users (for notifications)
  getDashboardUsers(dashboardId: number): Promise<User[]>;
  
  // Dashboard Backups
  getDashboardBackups(dashboardId: number, limit?: number): Promise<DashboardBackup[]>;
  createDashboardBackup(backup: InsertDashboardBackup): Promise<DashboardBackup>;
  deleteDashboardBackup(backupId: number): Promise<boolean>;
  restoreDashboardBackup(backupId: number): Promise<boolean>;
  
  // Dashboard Versions
  getDashboardVersions(dashboardId: number): Promise<DashboardVersion[]>;
  createDashboardVersion(version: InsertDashboardVersion): Promise<DashboardVersion>;
  setActiveVersion(dashboardId: number, versionId: number): Promise<boolean>;
  
  // Backup Schedules
  getBackupSchedules(dashboardId: number): Promise<BackupSchedule[]>;
  createBackupSchedule(schedule: InsertBackupSchedule): Promise<BackupSchedule>;
  updateBackupSchedule(scheduleId: number, schedule: Partial<InsertBackupSchedule>): Promise<BackupSchedule | undefined>;
  deleteBackupSchedule(scheduleId: number): Promise<boolean>;
  
  // Activity Dependencies
  getActivityDependencies(dashboardId: number): Promise<ActivityDependency[]>;
  getActivityDependenciesByActivity(activityId: number): Promise<ActivityDependency[]>;
  createActivityDependency(dependency: InsertActivityDependency): Promise<ActivityDependency>;
  updateActivityDependency(dependencyId: number, dependency: Partial<InsertActivityDependency>): Promise<ActivityDependency | undefined>;
  deleteActivityDependency(dependencyId: number): Promise<boolean>;
  
  // Activity Constraints
  getActivityConstraints(dashboardId: number): Promise<ActivityConstraint[]>;
  getActivityConstraintsByActivity(activityId: number): Promise<ActivityConstraint[]>;
  createActivityConstraint(constraint: InsertActivityConstraint): Promise<ActivityConstraint>;
  updateActivityConstraint(constraintId: number, constraint: Partial<InsertActivityConstraint>): Promise<ActivityConstraint | undefined>;
  deleteActivityConstraint(constraintId: number): Promise<boolean>;
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
  { id: 1, name: 'Análise de Requisitos', description: 'Levantamento e análise dos requisitos do projeto', projectId: 1, dashboardId: 1, parentActivityId: null, discipline: 'Análise', responsible: 'João Silva', priority: 'high', status: 'completed', plannedStartDate: new Date('2024-01-01'), plannedEndDate: new Date('2024-01-15'), actualStartDate: new Date('2024-01-01'), actualEndDate: new Date('2024-01-14'), baselineStartDate: new Date('2024-01-01'), baselineEndDate: new Date('2024-01-15'), plannedValue: '10000', actualCost: '9500', earnedValue: '10000', completionPercentage: '100', associatedRisk: 'baixo', requiredResources: ['Analista Senior'], dependencies: [], documentLink: null, duration: 14, bufferTime: 0, isAutoScheduled: true, criticalPath: false, sortOrder: 0, level: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'Desenvolvimento Frontend', description: 'Implementação da interface do usuário', projectId: 1, dashboardId: 1, parentActivityId: null, discipline: 'Desenvolvimento', responsible: 'Maria Santos', priority: 'medium', status: 'in_progress', plannedStartDate: new Date('2024-01-15'), plannedEndDate: new Date('2024-03-15'), actualStartDate: new Date('2024-01-16'), actualEndDate: null, baselineStartDate: new Date('2024-01-15'), baselineEndDate: new Date('2024-03-15'), plannedValue: '25000', actualCost: '18000', earnedValue: '15000', completionPercentage: '60', associatedRisk: 'médio', requiredResources: ['Desenvolvedor Frontend'], dependencies: ['Análise de Requisitos'], documentLink: null, duration: 60, bufferTime: 5, isAutoScheduled: true, criticalPath: true, sortOrder: 1, level: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: 'Desenvolvimento Backend', description: 'Implementação da API e lógica de negócio', projectId: 1, dashboardId: 1, parentActivityId: null, discipline: 'Desenvolvimento', responsible: 'Pedro Costa', priority: 'high', status: 'in_progress', plannedStartDate: new Date('2024-01-20'), plannedEndDate: new Date('2024-04-20'), actualStartDate: new Date('2024-01-22'), actualEndDate: null, baselineStartDate: new Date('2024-01-20'), baselineEndDate: new Date('2024-04-20'), plannedValue: '30000', actualCost: '12000', earnedValue: '9000', completionPercentage: '30', associatedRisk: 'alto', requiredResources: ['Desenvolvedor Backend'], dependencies: ['Análise de Requisitos'], documentLink: null, duration: 90, bufferTime: 3, isAutoScheduled: true, criticalPath: true, sortOrder: 2, level: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: 'Testes de Integração', description: 'Testes de integração entre frontend e backend', projectId: 1, dashboardId: 1, parentActivityId: null, discipline: 'Qualidade', responsible: 'Ana Lima', priority: 'medium', status: 'not_started', plannedStartDate: new Date('2024-04-01'), plannedEndDate: new Date('2024-05-01'), actualStartDate: null, actualEndDate: null, baselineStartDate: new Date('2024-04-01'), baselineEndDate: new Date('2024-05-01'), plannedValue: '15000', actualCost: '0', earnedValue: '0', completionPercentage: '0', associatedRisk: 'baixo', requiredResources: ['Testador QA'], dependencies: ['Desenvolvimento Frontend', 'Desenvolvimento Backend'], documentLink: null, duration: 30, bufferTime: 2, isAutoScheduled: true, criticalPath: false, sortOrder: 3, level: 0, createdAt: new Date(), updatedAt: new Date() }
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
      avatar: user.avatar || null,
      role: user.role || 'user',
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
      description: dashboard.description || null,
      ownerId: dashboard.ownerId || null,
      isPublic: dashboard.isPublic || null,
      theme: dashboard.theme || null,
      settings: dashboard.settings || {},
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
      description: project.description || null,
      status: project.status || null,
      dashboardId: project.dashboardId || null,
      budget: project.budget || null,
      actualCost: project.actualCost || null,
      startDate: project.startDate || null,
      endDate: project.endDate || null,
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
      description: activity.description || null,
      status: activity.status || null,
      dashboardId: activity.dashboardId || null,
      parentActivityId: activity.parentActivityId || null,
      actualCost: activity.actualCost || null,
      actualStartDate: activity.actualStartDate || null,
      actualEndDate: activity.actualEndDate || null,
      associatedRisk: activity.associatedRisk || null,
      completionPercentage: activity.completionPercentage || null,
      documentLink: activity.documentLink || null,
      earnedValue: activity.earnedValue || null,
      plannedValue: activity.plannedValue || null,
      priority: activity.priority || null,
      projectId: activity.projectId || null,
      plannedStartDate: activity.plannedStartDate || null,
      plannedEndDate: activity.plannedEndDate || null,
      baselineStartDate: activity.baselineStartDate || null,
      baselineEndDate: activity.baselineEndDate || null,
      requiredResources: activity.requiredResources || null,
      dependencies: activity.dependencies || null,
      duration: activity.duration || null,
      bufferTime: activity.bufferTime || null,
      isAutoScheduled: activity.isAutoScheduled || null,
      criticalPath: activity.criticalPath || null,
      sortOrder: activity.sortOrder || 0,
      level: activity.level || 0,
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
    // For now, return empty array as the table might not exist yet
    return [];
  }

  async createDashboardShare(share: InsertDashboardShare): Promise<DashboardShare> {
    if (db) {
      const result = await db.insert(dashboardShares).values(share).returning();
      return result[0];
    }
    const newShare: DashboardShare = {
      id: mockDashboardShares.length + 1,
      dashboardId: share.dashboardId || null,
      userId: share.userId || null,
      sharedById: share.sharedById || null,
      permission: share.permission || null,
      canView: share.canView ?? true,
      canEdit: share.canEdit ?? false,
      canDelete: share.canDelete ?? false,
      canShare: share.canShare ?? false,
      canExport: share.canExport ?? false,
      canCreateActivities: share.canCreateActivities ?? false,
      canEditActivities: share.canEditActivities ?? false,
      canDeleteActivities: share.canDeleteActivities ?? false,
      canViewReports: share.canViewReports ?? true,
      canManageCustomColumns: share.canManageCustomColumns ?? false,
      canManageCustomCharts: share.canManageCustomCharts ?? false,
      expiresAt: share.expiresAt ?? null,
      isActive: share.isActive ?? true,
      notes: share.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
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
      dashboardId: log.dashboardId || null,
      userId: log.userId || null,
      entityId: log.entityId || null,
      details: log.details || {},
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
      options: column.options || null,
      dashboardId: column.dashboardId || null,
      formula: column.formula || null,
      isVisible: column.isVisible || null,
      sortOrder: column.sortOrder || null,
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
      dashboardId: chart.dashboardId || null,
      isVisible: chart.isVisible || null,
      sortOrder: chart.sortOrder || null,
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

  // Notifications
  async getNotifications(userId: number, limit: number = 50): Promise<Notification[]> {
    if (!db) return [];
    
    try {
      const result = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
      return result;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    if (!db) return [];
    
    try {
      const result = await db.select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        ))
        .orderBy(desc(notifications.createdAt));
      return result;
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      return [];
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    if (!db) {
      const newNotification: Notification = {
        id: Date.now(),
        userId: notification.userId,
        dashboardId: notification.dashboardId || null,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || null,
        read: false,
        createdAt: new Date(),
      };
      return newNotification;
    }
    
    try {
      const result = await db.insert(notifications).values(notification).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    if (!db) return false;
    
    try {
      await db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, notificationId));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    if (!db) return false;
    
    try {
      await db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, userId));
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  async deleteNotification(id: number): Promise<boolean> {
    if (!db) return false;
    
    try {
      await db.delete(notifications).where(eq(notifications.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  async getNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined> {
    if (!db) return undefined;
    
    try {
      const result = await db.select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));
      return result[0];
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return undefined;
    }
  }

  async updateNotificationPreferences(userId: number, preferences: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences | undefined> {
    if (!db) return undefined;
    
    try {
      const result = await db.update(notificationPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(notificationPreferences.userId, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return undefined;
    }
  }

  async getDashboardUsers(dashboardId: number): Promise<User[]> {
    if (!db) return [];
    
    try {
      // Get dashboard owner
      const dashboard = await db.select()
        .from(dashboards)
        .where(eq(dashboards.id, dashboardId));
      
      if (!dashboard[0]) return [];
      
      // Get dashboard owner user
      const owner = await db.select()
        .from(users)
        .where(eq(users.id, dashboard[0].ownerId || 1));
      
      // Get shared users
      const sharedUsers = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
        .from(dashboardShares)
        .innerJoin(users, eq(dashboardShares.userId, users.id))
        .where(eq(dashboardShares.dashboardId, dashboardId));
      
      // Combine owner and shared users, remove duplicates
      const allUsers = [...owner, ...sharedUsers];
      const uniqueUsers = allUsers.filter((user, index, self) => 
        self.findIndex(u => u.id === user.id) === index
      );
      
      return uniqueUsers;
    } catch (error) {
      console.error('Error getting dashboard users:', error);
      return [];
    }
  }

  // Dashboard Backups
  async getDashboardBackups(dashboardId: number, limit: number = 50): Promise<DashboardBackup[]> {
    if (!db) return [];

    try {
      const result = await db
        .select()
        .from(dashboardBackups)
        .where(eq(dashboardBackups.dashboardId, dashboardId))
        .orderBy(desc(dashboardBackups.createdAt))
        .limit(limit);

      return result;
    } catch (error) {
      console.error('Error fetching dashboard backups:', error);
      return [];
    }
  }

  async createDashboardBackup(backup: InsertDashboardBackup): Promise<DashboardBackup> {
    if (!db) throw new Error('Database not available');

    try {
      const result = await db
        .insert(dashboardBackups)
        .values(backup)
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error creating dashboard backup:', error);
      throw error;
    }
  }

  async deleteDashboardBackup(backupId: number): Promise<boolean> {
    if (!db) return false;

    try {
      const result = await db
        .delete(dashboardBackups)
        .where(eq(dashboardBackups.id, backupId));

      return result.count > 0;
    } catch (error) {
      console.error('Error deleting dashboard backup:', error);
      return false;
    }
  }

  async restoreDashboardBackup(backupId: number): Promise<boolean> {
    if (!db) return false;

    try {
      // Get backup data
      const backup = await db
        .select()
        .from(dashboardBackups)
        .where(eq(dashboardBackups.id, backupId))
        .limit(1);

      if (backup.length === 0) {
        throw new Error('Backup not found');
      }

      const backupData = backup[0];
      
      // Begin transaction to restore data
      await db.transaction(async (tx) => {
        // Restore dashboard data
        await tx
          .update(dashboards)
          .set(backupData.dashboardData as any)
          .where(eq(dashboards.id, backupData.dashboardId));

        // Delete existing activities and restore from backup
        await tx
          .delete(activities)
          .where(eq(activities.dashboardId, backupData.dashboardId));

        if (Array.isArray(backupData.activitiesData)) {
          for (const activity of backupData.activitiesData as any[]) {
            await tx.insert(activities).values(activity);
          }
        }

        // Restore custom columns
        await tx
          .delete(customColumns)
          .where(eq(customColumns.dashboardId, backupData.dashboardId));

        if (Array.isArray(backupData.customColumnsData)) {
          for (const column of backupData.customColumnsData as any[]) {
            await tx.insert(customColumns).values(column);
          }
        }

        // Restore custom charts
        await tx
          .delete(customCharts)
          .where(eq(customCharts.dashboardId, backupData.dashboardId));

        if (Array.isArray(backupData.customChartsData)) {
          for (const chart of backupData.customChartsData as any[]) {
            await tx.insert(customCharts).values(chart);
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Error restoring dashboard backup:', error);
      return false;
    }
  }

  // Dashboard Versions
  async getDashboardVersions(dashboardId: number): Promise<DashboardVersion[]> {
    if (!db) return [];

    try {
      const result = await db
        .select()
        .from(dashboardVersions)
        .where(eq(dashboardVersions.dashboardId, dashboardId))
        .orderBy(desc(dashboardVersions.createdAt));

      return result;
    } catch (error) {
      console.error('Error fetching dashboard versions:', error);
      return [];
    }
  }

  async createDashboardVersion(version: InsertDashboardVersion): Promise<DashboardVersion> {
    if (!db) throw new Error('Database not available');

    try {
      const result = await db
        .insert(dashboardVersions)
        .values(version)
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error creating dashboard version:', error);
      throw error;
    }
  }

  async setActiveVersion(dashboardId: number, versionId: number): Promise<boolean> {
    if (!db) return false;

    try {
      await db.transaction(async (tx) => {
        // Set all versions as inactive
        await tx
          .update(dashboardVersions)
          .set({ isActive: false })
          .where(eq(dashboardVersions.dashboardId, dashboardId));

        // Set the specific version as active
        await tx
          .update(dashboardVersions)
          .set({ isActive: true, publishedAt: new Date() })
          .where(eq(dashboardVersions.id, versionId));
      });

      return true;
    } catch (error) {
      console.error('Error setting active version:', error);
      return false;
    }
  }

  // Backup Schedules
  async getBackupSchedules(dashboardId: number): Promise<BackupSchedule[]> {
    if (!db) return [];

    try {
      const result = await db
        .select()
        .from(backupSchedules)
        .where(eq(backupSchedules.dashboardId, dashboardId))
        .orderBy(desc(backupSchedules.createdAt));

      return result;
    } catch (error) {
      console.error('Error fetching backup schedules:', error);
      return [];
    }
  }

  async createBackupSchedule(schedule: InsertBackupSchedule): Promise<BackupSchedule> {
    if (!db) throw new Error('Database not available');

    try {
      const result = await db
        .insert(backupSchedules)
        .values(schedule)
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error creating backup schedule:', error);
      throw error;
    }
  }

  async updateBackupSchedule(scheduleId: number, schedule: Partial<InsertBackupSchedule>): Promise<BackupSchedule | undefined> {
    if (!db) return undefined;

    try {
      const result = await db
        .update(backupSchedules)
        .set({ ...schedule, updatedAt: new Date() })
        .where(eq(backupSchedules.id, scheduleId))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating backup schedule:', error);
      return undefined;
    }
  }

  async deleteBackupSchedule(scheduleId: number): Promise<boolean> {
    if (!db) return false;

    try {
      const result = await db
        .delete(backupSchedules)
        .where(eq(backupSchedules.id, scheduleId));

      return result.count > 0;
    } catch (error) {
      console.error('Error deleting backup schedule:', error);
      return false;
    }
  }

  // Activity Dependencies
  async getActivityDependencies(dashboardId: number): Promise<ActivityDependency[]> {
    if (!db) return [];

    try {
      const result = await db
        .select()
        .from(activityDependencies)
        .innerJoin(activities, eq(activityDependencies.predecessorId, activities.id))
        .where(eq(activities.dashboardId, dashboardId));

      return result.map(r => r.activity_dependencies);
    } catch (error) {
      console.error('Error fetching activity dependencies:', error);
      return [];
    }
  }

  async getActivityDependenciesByActivity(activityId: number): Promise<ActivityDependency[]> {
    if (!db) return [];

    try {
      const result = await db
        .select()
        .from(activityDependencies)
        .where(
          or(
            eq(activityDependencies.predecessorId, activityId),
            eq(activityDependencies.successorId, activityId)
          )
        );

      return result;
    } catch (error) {
      console.error('Error fetching activity dependencies by activity:', error);
      return [];
    }
  }

  async createActivityDependency(dependency: InsertActivityDependency): Promise<ActivityDependency> {
    if (!db) throw new Error('Database not available');

    try {
      const result = await db
        .insert(activityDependencies)
        .values(dependency)
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error creating activity dependency:', error);
      throw error;
    }
  }

  async updateActivityDependency(dependencyId: number, dependency: Partial<InsertActivityDependency>): Promise<ActivityDependency | undefined> {
    if (!db) return undefined;

    try {
      const result = await db
        .update(activityDependencies)
        .set({ ...dependency, updatedAt: new Date() })
        .where(eq(activityDependencies.id, dependencyId))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating activity dependency:', error);
      return undefined;
    }
  }

  async deleteActivityDependency(dependencyId: number): Promise<boolean> {
    if (!db) return false;

    try {
      const result = await db
        .delete(activityDependencies)
        .where(eq(activityDependencies.id, dependencyId));

      return result.count > 0;
    } catch (error) {
      console.error('Error deleting activity dependency:', error);
      return false;
    }
  }

  // Activity Constraints
  async getActivityConstraints(dashboardId: number): Promise<ActivityConstraint[]> {
    if (!db) return [];

    try {
      const result = await db
        .select()
        .from(activityConstraints)
        .innerJoin(activities, eq(activityConstraints.activityId, activities.id))
        .where(eq(activities.dashboardId, dashboardId));

      return result.map(r => r.activity_constraints);
    } catch (error) {
      console.error('Error fetching activity constraints:', error);
      return [];
    }
  }

  async getActivityConstraintsByActivity(activityId: number): Promise<ActivityConstraint[]> {
    if (!db) return [];

    try {
      const result = await db
        .select()
        .from(activityConstraints)
        .where(eq(activityConstraints.activityId, activityId));

      return result;
    } catch (error) {
      console.error('Error fetching activity constraints by activity:', error);
      return [];
    }
  }

  async createActivityConstraint(constraint: InsertActivityConstraint): Promise<ActivityConstraint> {
    if (!db) throw new Error('Database not available');

    try {
      const result = await db
        .insert(activityConstraints)
        .values(constraint)
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error creating activity constraint:', error);
      throw error;
    }
  }

  async updateActivityConstraint(constraintId: number, constraint: Partial<InsertActivityConstraint>): Promise<ActivityConstraint | undefined> {
    if (!db) return undefined;

    try {
      const result = await db
        .update(activityConstraints)
        .set({ ...constraint, updatedAt: new Date() })
        .where(eq(activityConstraints.id, constraintId))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating activity constraint:', error);
      return undefined;
    }
  }

  async deleteActivityConstraint(constraintId: number): Promise<boolean> {
    if (!db) return false;

    try {
      const result = await db
        .delete(activityConstraints)
        .where(eq(activityConstraints.id, constraintId));

      return result.count > 0;
    } catch (error) {
      console.error('Error deleting activity constraint:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
export { db };

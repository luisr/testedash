import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  role: text("role").notNull().default("user"), // user, admin, manager
  passwordHash: text("password_hash"), // For simple authentication
  isActive: boolean("is_active").default(true),
  isSuperUser: boolean("is_super_user").default(false), // Super user can access consolidated dashboard
  mustChangePassword: boolean("must_change_password").default(true), // Forces password change on first login
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sessions table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Project collaborators table
export const projectCollaborators = pgTable("project_collaborators", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("viewer"), // viewer, contributor, manager, admin
  // Granular permissions
  canView: boolean("can_view").default(true),
  canEdit: boolean("can_edit").default(false),
  canCreate: boolean("can_create").default(false),
  canDelete: boolean("can_delete").default(false),
  canManageActivities: boolean("can_manage_activities").default(false),
  canViewReports: boolean("can_view_reports").default(true),
  canExportData: boolean("can_export_data").default(false),
  canManageCollaborators: boolean("can_manage_collaborators").default(false),
  // Access control
  isActive: boolean("is_active").default(true),
  invitedById: integer("invited_by_id").references(() => users.id),
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  expiresAt: timestamp("expires_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").references(() => users.id),
  isPublic: boolean("is_public").default(false),
  theme: text("theme").default("light"), // light, dark, blue-green
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  dashboardId: integer("dashboard_id").references(() => dashboards.id),
  // managerId: integer("manager_id").references(() => users.id), // Project manager - temporarily removed
  status: text("status").default("active"), // active, completed, paused, cancelled
  budget: decimal("budget", { precision: 15, scale: 2 }).default("0"),
  actualCost: decimal("actual_cost", { precision: 15, scale: 2 }).default("0"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  projectId: integer("project_id").references(() => projects.id),
  dashboardId: integer("dashboard_id").references(() => dashboards.id),
  parentActivityId: integer("parent_activity_id"), // For sub-activities
  discipline: text("discipline").notNull(),
  responsible: text("responsible").notNull(),
  priority: text("priority").default("medium"), // low, medium, high, critical
  status: text("status").default("not_started"), // not_started, in_progress, completed, delayed, cancelled
  plannedStartDate: timestamp("planned_start_date"),
  plannedEndDate: timestamp("planned_end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  baselineStartDate: timestamp("baseline_start_date"),
  baselineEndDate: timestamp("baseline_end_date"),
  plannedValue: decimal("planned_value", { precision: 15, scale: 2 }).default("0"),
  actualCost: decimal("actual_cost", { precision: 15, scale: 2 }).default("0"),
  earnedValue: decimal("earned_value", { precision: 15, scale: 2 }).default("0"),
  completionPercentage: decimal("completion_percentage", { precision: 5, scale: 2 }).default("0"),
  associatedRisk: text("associated_risk"),
  requiredResources: text("required_resources").array(),
  dependencies: text("dependencies").array(),
  documentLink: text("document_link"),
  duration: integer("duration"), // Duration in days
  bufferTime: integer("buffer_time").default(0), // Buffer time in days
  isAutoScheduled: boolean("is_auto_scheduled").default(true), // Whether dates are auto-calculated
  criticalPath: boolean("critical_path").default(false), // Whether this activity is on critical path
  isMilestone: boolean("is_milestone").default(false), // Whether this activity is a project milestone
  sortOrder: integer("sort_order").default(0), // For ordering sub-activities
  level: integer("level").default(0), // Hierarchy level (0 = root, 1 = first level sub-activity, etc.)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dashboardShares = pgTable("dashboard_shares", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id),
  userId: integer("user_id").references(() => users.id),
  sharedById: integer("shared_by_id").references(() => users.id),
  permission: text("permission").default("view"), // view, edit, admin
  // Granular permissions
  canView: boolean("can_view").default(true),
  canEdit: boolean("can_edit").default(false),
  canDelete: boolean("can_delete").default(false),
  canShare: boolean("can_share").default(false),
  canExport: boolean("can_export").default(false),
  canCreateActivities: boolean("can_create_activities").default(false),
  canEditActivities: boolean("can_edit_activities").default(false),
  canDeleteActivities: boolean("can_delete_activities").default(false),
  canViewReports: boolean("can_view_reports").default(true),
  canManageCustomColumns: boolean("can_manage_custom_columns").default(false),
  canManageCustomCharts: boolean("can_manage_custom_charts").default(false),
  // Optional expiration and restrictions
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // create, update, delete, share, export
  entityType: text("entity_type").notNull(), // activity, project, dashboard
  entityId: integer("entity_id"),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const customColumns = pgTable("custom_columns", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // text, number, date, formula, select
  formula: text("formula"),
  options: text("options").array(),
  isVisible: boolean("is_visible").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customCharts = pgTable("custom_charts", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // bar, line, pie, scatter
  config: jsonb("config").notNull(),
  isVisible: boolean("is_visible").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Real-time notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id),
  type: text("type").notNull(), // activity_created, activity_updated, activity_deleted, dashboard_shared, etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional context data
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User notification preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  activityUpdates: boolean("activity_updates").default(true).notNull(),
  dashboardShares: boolean("dashboard_shares").default(true).notNull(),
  systemAlerts: boolean("system_alerts").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dashboard Backups and Versioning
export const dashboardBackups = pgTable("dashboard_backups", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  version: text("version").notNull(), // e.g., "v1.0.0", "v1.1.0"
  backupType: text("backup_type").notNull(), // manual, automatic, scheduled
  triggerEvent: text("trigger_event"), // activity_change, structure_change, user_request
  dashboardData: jsonb("dashboard_data").notNull(),
  activitiesData: jsonb("activities_data").notNull(),
  projectsData: jsonb("projects_data").notNull(),
  customColumnsData: jsonb("custom_columns_data").notNull(),
  customChartsData: jsonb("custom_charts_data").notNull(),
  metadata: jsonb("metadata"), // additional backup metadata
  description: text("description"),
  fileSize: integer("file_size"), // backup size in bytes
  checksum: text("checksum"), // MD5 checksum for integrity
  isRestorable: boolean("is_restorable").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // optional expiration
});

export const dashboardVersions = pgTable("dashboard_versions", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  parentVersionId: integer("parent_version_id"),
  version: text("version").notNull(),
  versionName: text("version_name"), // user-friendly name
  changes: jsonb("changes").notNull(), // detailed change log
  changedBy: integer("changed_by").references(() => users.id).notNull(),
  changeType: text("change_type").notNull(), // major, minor, patch
  releaseNotes: text("release_notes"),
  isActive: boolean("is_active").default(false).notNull(),
  isDraft: boolean("is_draft").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
});

export const backupSchedules = pgTable("backup_schedules", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  scheduleType: text("schedule_type").notNull(), // daily, weekly, monthly
  frequency: integer("frequency").default(1).notNull(), // every N days/weeks/months
  time: text("time"), // HH:MM format
  dayOfWeek: integer("day_of_week"), // 0-6 for weekly
  dayOfMonth: integer("day_of_month"), // 1-31 for monthly
  maxBackups: integer("max_backups").default(10).notNull(), // retention limit
  isActive: boolean("is_active").default(true).notNull(),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity Dependencies Table
export const activityDependencies = pgTable("activity_dependencies", {
  id: serial("id").primaryKey(),
  predecessorId: integer("predecessor_id").notNull().references(() => activities.id),
  successorId: integer("successor_id").notNull().references(() => activities.id),
  dependencyType: text("dependency_type").notNull().default("finish_to_start"), // finish_to_start, start_to_start, finish_to_finish, start_to_finish
  lagTime: integer("lag_time").default(0), // Lag time in days (can be negative for lead time)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity Constraints Table
export const activityConstraints = pgTable("activity_constraints", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull().references(() => activities.id),
  constraintType: text("constraint_type").notNull(), // must_start_on, must_finish_on, start_no_earlier_than, start_no_later_than, finish_no_earlier_than, finish_no_later_than
  constraintDate: timestamp("constraint_date").notNull(),
  priority: text("priority").default("medium"), // low, medium, high
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom Status Configuration
export const customStatuses = pgTable("custom_statuses", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  color: text("color").notNull(),
  backgroundColor: text("background_color").notNull(),
  borderColor: text("border_color").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(1).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Custom KPIs
export const customKPIs = pgTable("custom_kpis", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  dataSource: text("data_source").notNull().default("activities"), // activities, projects, custom
  field: text("field").notNull(),
  aggregation: text("aggregation").notNull(), // count, sum, avg, min, max, percentage
  filters: jsonb("filters").default('[]').notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  format: text("format").notNull(), // number, currency, percentage, days
  target: text("target"),
  targetComparison: text("target_comparison").default('gt').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(1).notNull(),
  size: text("size").default('medium').notNull(), // small, medium, large
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Date Changes Audit table
export const dateChangesAudit = pgTable("date_changes_audit", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").references(() => dashboards.id).notNull(),
  activityId: integer("activity_id").references(() => activities.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fieldName: text("field_name").notNull(), // 'plannedStartDate', 'plannedEndDate', 'actualStartDate', 'actualEndDate'
  oldValue: timestamp("old_value"),
  newValue: timestamp("new_value"),
  justification: text("justification").notNull(),
  changeReason: text("change_reason"), // 'client_request', 'resource_availability', 'technical_issue', 'scope_change', 'other'
  impactDescription: text("impact_description"),
  approvedBy: integer("approved_by").references(() => users.id), // Optional approval workflow
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDashboardSchema = createInsertSchema(dashboards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDashboardShareSchema = createInsertSchema(dashboardShares).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, timestamp: true });
export const insertCustomColumnSchema = createInsertSchema(customColumns).omit({ id: true, createdAt: true });
export const insertCustomChartSchema = createInsertSchema(customCharts).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDashboardBackupSchema = createInsertSchema(dashboardBackups).omit({ id: true, createdAt: true });
export const insertDashboardVersionSchema = createInsertSchema(dashboardVersions).omit({ id: true, createdAt: true, publishedAt: true });
export const insertBackupScheduleSchema = createInsertSchema(backupSchedules).omit({ id: true, createdAt: true, updatedAt: true, lastRun: true, nextRun: true });
export const insertActivityDependencySchema = createInsertSchema(activityDependencies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivityConstraintSchema = createInsertSchema(activityConstraints).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomStatusSchema = createInsertSchema(customStatuses).omit({ id: true, createdAt: true });
export const insertCustomKPISchema = createInsertSchema(customKPIs).omit({ id: true, createdAt: true });
export const insertDateChangesAuditSchema = createInsertSchema(dateChangesAudit).omit({ id: true, createdAt: true });
export const insertProjectCollaboratorSchema = createInsertSchema(projectCollaborators).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export type InsertProjectCollaborator = z.infer<typeof insertProjectCollaboratorSchema>;
export type Dashboard = typeof dashboards.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type DashboardShare = typeof dashboardShares.$inferSelect;
export type InsertDashboardShare = z.infer<typeof insertDashboardShareSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type CustomColumn = typeof customColumns.$inferSelect;
export type InsertCustomColumn = z.infer<typeof insertCustomColumnSchema>;
export type CustomChart = typeof customCharts.$inferSelect;
export type InsertCustomChart = z.infer<typeof insertCustomChartSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type DashboardBackup = typeof dashboardBackups.$inferSelect;
export type InsertDashboardBackup = z.infer<typeof insertDashboardBackupSchema>;
export type DashboardVersion = typeof dashboardVersions.$inferSelect;
export type InsertDashboardVersion = z.infer<typeof insertDashboardVersionSchema>;
export type BackupSchedule = typeof backupSchedules.$inferSelect;
export type InsertBackupSchedule = z.infer<typeof insertBackupScheduleSchema>;
export type ActivityDependency = typeof activityDependencies.$inferSelect;
export type InsertActivityDependency = z.infer<typeof insertActivityDependencySchema>;
export type ActivityConstraint = typeof activityConstraints.$inferSelect;
export type InsertActivityConstraint = z.infer<typeof insertActivityConstraintSchema>;
export type CustomStatus = typeof customStatuses.$inferSelect;
export type InsertCustomStatus = z.infer<typeof insertCustomStatusSchema>;
export type CustomKPI = typeof customKPIs.$inferSelect;
export type InsertCustomKPI = z.infer<typeof insertCustomKPISchema>;
export type DateChangesAudit = typeof dateChangesAudit.$inferSelect;
export type InsertDateChangesAudit = z.infer<typeof insertDateChangesAuditSchema>;

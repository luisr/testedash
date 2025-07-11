import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  role: text("role").notNull().default("user"), // user, admin, manager
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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
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

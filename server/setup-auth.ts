import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

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

export async function setupAuthTables() {
  if (!connectionString) {
    console.error('No database connection string available');
    return;
  }

  const client = postgres(connectionString);

  try {
    console.log('🔄 Setting up authentication tables...');
    
    // Add authentication columns to users table
    try {
      await client`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`;
      await client`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`;
      await client`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_user BOOLEAN DEFAULT FALSE`;
    } catch (error) {
      console.log('Users table columns already exist:', error.message);
    }

    // Create project_collaborators table
    await client`
      CREATE TABLE IF NOT EXISTS project_collaborators (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'viewer',
        can_view BOOLEAN DEFAULT TRUE,
        can_edit BOOLEAN DEFAULT FALSE,
        can_create BOOLEAN DEFAULT FALSE,
        can_delete BOOLEAN DEFAULT FALSE,
        can_manage_activities BOOLEAN DEFAULT FALSE,
        can_view_reports BOOLEAN DEFAULT TRUE,
        can_export_data BOOLEAN DEFAULT FALSE,
        can_manage_collaborators BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        invited_by_id INTEGER REFERENCES users(id),
        invited_at TIMESTAMP DEFAULT NOW(),
        accepted_at TIMESTAMP,
        expires_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create indexes
    await client`
      CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
    `;
    
    await client`
      CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);
    `;
    
    await client`
      CREATE INDEX IF NOT EXISTS idx_project_collaborators_active ON project_collaborators(is_active);
    `;

    // Add unique constraint
    try {
      await client`ALTER TABLE project_collaborators ADD CONSTRAINT unique_project_user UNIQUE (project_id, user_id)`;
    } catch (error) {
      console.log('Unique constraint already exists:', error.message);
    }

    // Add default password hash for existing users (bcrypt hash of "password123")
    await client`
      UPDATE users 
      SET password_hash = '$2b$10$K7o8YZGNn2ZlgKzWVOxzfeJ4NuTNrWIYCMmLiKqXWYKJKJfNZUZqK'
      WHERE password_hash IS NULL;
    `;

    // Set all users as active
    await client`
      UPDATE users 
      SET is_active = TRUE 
      WHERE is_active IS NULL;
    `;

    // Set Luis as super user
    await client`
      UPDATE users 
      SET is_super_user = TRUE 
      WHERE email = 'luis.ribeiro@beachpark.com.br';
    `;

    // Insert default collaborators for existing projects
    await client`
      INSERT INTO project_collaborators (project_id, user_id, role, can_view, can_edit, can_create, can_manage_activities, can_view_reports, can_export_data, can_manage_collaborators, is_active, invited_by_id)
      SELECT 
        p.id as project_id,
        u.id as user_id,
        CASE 
          WHEN u.role = 'admin' THEN 'admin'
          WHEN u.role = 'manager' THEN 'manager'
          ELSE 'contributor'
        END as role,
        TRUE as can_view,
        CASE WHEN u.role IN ('admin', 'manager') THEN TRUE ELSE FALSE END as can_edit,
        CASE WHEN u.role IN ('admin', 'manager') THEN TRUE ELSE FALSE END as can_create,
        CASE WHEN u.role IN ('admin', 'manager') THEN TRUE ELSE FALSE END as can_manage_activities,
        TRUE as can_view_reports,
        CASE WHEN u.role = 'admin' THEN TRUE ELSE FALSE END as can_export_data,
        CASE WHEN u.role = 'admin' THEN TRUE ELSE FALSE END as can_manage_collaborators,
        TRUE as is_active,
        1 as invited_by_id
      FROM projects p
      CROSS JOIN users u
      WHERE NOT EXISTS (
        SELECT 1 FROM project_collaborators pc 
        WHERE pc.project_id = p.id AND pc.user_id = u.id
      );
    `;

    console.log('✅ Authentication tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up authentication tables:', error);
  } finally {
    await client.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupAuthTables();
}
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create connection
const sql = postgres(databaseUrl);
const db = drizzle(sql);

async function createBackupTables() {
  try {
    console.log('Creating backup tables...');
    
    // Create dashboard_backups table
    await sql`
      CREATE TABLE IF NOT EXISTS dashboard_backups (
        id SERIAL PRIMARY KEY,
        dashboard_id INTEGER NOT NULL REFERENCES dashboards(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        version TEXT NOT NULL,
        backup_type TEXT NOT NULL,
        trigger_event TEXT,
        dashboard_data JSONB NOT NULL,
        activities_data JSONB NOT NULL,
        projects_data JSONB NOT NULL,
        custom_columns_data JSONB NOT NULL,
        custom_charts_data JSONB NOT NULL,
        metadata JSONB,
        description TEXT,
        file_size INTEGER,
        checksum TEXT,
        is_restorable BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP
      )
    `;
    
    // Create dashboard_versions table
    await sql`
      CREATE TABLE IF NOT EXISTS dashboard_versions (
        id SERIAL PRIMARY KEY,
        dashboard_id INTEGER NOT NULL REFERENCES dashboards(id),
        parent_version_id INTEGER REFERENCES dashboard_versions(id),
        version TEXT NOT NULL,
        version_name TEXT,
        changes JSONB NOT NULL,
        changed_by INTEGER NOT NULL REFERENCES users(id),
        change_type TEXT NOT NULL,
        release_notes TEXT,
        is_active BOOLEAN NOT NULL DEFAULT false,
        is_draft BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        published_at TIMESTAMP
      )
    `;
    
    // Create backup_schedules table
    await sql`
      CREATE TABLE IF NOT EXISTS backup_schedules (
        id SERIAL PRIMARY KEY,
        dashboard_id INTEGER NOT NULL REFERENCES dashboards(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        schedule_type TEXT NOT NULL,
        frequency INTEGER NOT NULL,
        time TEXT,
        day_of_week INTEGER,
        day_of_month INTEGER,
        max_backups INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_run TIMESTAMP,
        next_run TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    console.log('✅ Backup tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating backup tables:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the script
createBackupTables()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcrypt";

// Check if DATABASE_URL is properly configured or build from individual components
let connectionString = process.env.DATABASE_URL;

// If DATABASE_URL is not set or invalid, try to build it from individual components
if (!connectionString || !connectionString.startsWith('postgresql://')) {
  const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
  if (PGUSER && PGPASSWORD && PGHOST && PGPORT && PGDATABASE) {
    connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
  }
}

async function setupDefaultUser() {
  if (!connectionString) {
    console.error('No database connection string available');
    return;
  }

  const client = postgres(connectionString);

  try {
    console.log('🔄 Setting up default user and cleaning database...');
    
    // Hash password for default user
    const passwordHash = await bcrypt.hash('Lilian@2019', 10);
    
    // Get current projects to create corresponding dashboards
    const projects = await client`SELECT id, name, description FROM projects`;
    
    // First, clean up related data to avoid foreign key constraints
    await client`DELETE FROM project_collaborators WHERE user_id != 5`;
    await client`DELETE FROM activity_logs WHERE user_id != 5`;
    await client`DELETE FROM notifications WHERE user_id != 5`;
    await client`DELETE FROM dashboard_shares WHERE user_id != 5`;
    await client`DELETE FROM backup_schedules WHERE user_id != 5`;
    await client`DELETE FROM dashboard_backups WHERE user_id != 5`;
    await client`DELETE FROM date_changes_audit WHERE user_id != 5`;
    
    // Delete all users except the one we want to keep (ID 5)
    await client`DELETE FROM users WHERE id != 5`;
    
    // Update the default user with correct password
    const result = await client`
      UPDATE users 
      SET password_hash = ${passwordHash}, 
          name = 'Luis Ribeiro Lima Neto',
          role = 'admin',
          is_active = true
      WHERE email = 'luis.ribeiro@beachpark.com.br'
      RETURNING id, email, name, role;
    `;
    
    if (result.length === 0) {
      // Create user if doesn't exist
      const newUser = await client`
        INSERT INTO users (email, name, role, password_hash, is_active)
        VALUES ('luis.ribeiro@beachpark.com.br', 'Luis Ribeiro Lima Neto', 'admin', ${passwordHash}, true)
        RETURNING id, email, name, role;
      `;
      console.log('✅ Default user created:', newUser[0]);
    } else {
      console.log('✅ Default user updated:', result[0]);
    }
    
    // Create dashboards for each project
    for (const project of projects) {
      await client`
        INSERT INTO dashboards (name, description, theme, created_at, updated_at)
        VALUES (${project.name}, ${project.description || `Dashboard for ${project.name}`}, 'default', NOW(), NOW())
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          updated_at = NOW()
      `;
      console.log(`✅ Dashboard created/updated for project: ${project.name}`);
    }
    
    console.log('📧 Email: luis.ribeiro@beachpark.com.br');
    console.log('🔑 Senha: Lilian@2019');
    console.log('✅ Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up default user:', error);
  } finally {
    await client.end();
  }
}

setupDefaultUser();
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Check if DATABASE_URL is properly configured or build from individual components
let connectionString = process.env.DATABASE_URL;

// If DATABASE_URL is not set or invalid, try to build it from individual components
if (!connectionString || !connectionString.startsWith('postgresql://')) {
  const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
  if (PGUSER && PGPASSWORD && PGHOST && PGPORT && PGDATABASE) {
    connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
  }
}

async function createProjectDashboards() {
  if (!connectionString) {
    console.error('No database connection string available');
    return;
  }

  const client = postgres(connectionString);

  try {
    console.log('🔄 Creating dashboards for projects...');
    
    // Get all projects
    const projects = await client`SELECT id, name, description FROM projects ORDER BY id`;
    
    console.log(`Found ${projects.length} projects`);
    
    // Create dashboards for each project
    for (const project of projects) {
      const dashboardName = project.name;
      const dashboardDescription = project.description || `Dashboard for ${project.name}`;
      
      try {
        await client`
          INSERT INTO dashboards (name, description, theme, created_at, updated_at)
          VALUES (${dashboardName}, ${dashboardDescription}, 'default', NOW(), NOW())
          ON CONFLICT (name) DO UPDATE SET
            description = EXCLUDED.description,
            updated_at = NOW()
        `;
        
        console.log(`✅ Dashboard created/updated: ${dashboardName}`);
      } catch (error) {
        console.log(`⚠️  Dashboard for ${dashboardName} already exists or error: ${error.message}`);
      }
    }
    
    // Show all dashboards
    const dashboards = await client`SELECT id, name, description FROM dashboards ORDER BY id`;
    console.log('\n📊 All dashboards:');
    dashboards.forEach(dashboard => {
      console.log(`- ${dashboard.name} (ID: ${dashboard.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error creating dashboards:', error);
  } finally {
    await client.end();
  }
}

createProjectDashboards();
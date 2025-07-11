import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// Database connection
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Build from individual components
  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  
  if (host && port && database && user && password) {
    connectionString = `postgres://${user}:${password}@${host}:${port}/${database}`;
    console.log('Built DATABASE_URL from individual components');
  } else {
    console.error('DATABASE_URL not found and individual components not available');
    process.exit(1);
  }
}

const client = postgres(connectionString);
const db = drizzle(client);

async function createAuditTable() {
  try {
    console.log('Creating date_changes_audit table...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS date_changes_audit (
        id SERIAL PRIMARY KEY,
        dashboard_id INTEGER NOT NULL REFERENCES dashboards(id),
        activity_id INTEGER NOT NULL REFERENCES activities(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        field_name TEXT NOT NULL,
        old_value TIMESTAMP,
        new_value TIMESTAMP,
        justification TEXT NOT NULL,
        change_reason TEXT,
        impact_description TEXT,
        approved_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    
    console.log('✅ Date changes audit table created successfully!');
  } catch (error) {
    console.error('Error creating audit table:', error);
  } finally {
    await client.end();
  }
}

createAuditTable();
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Build database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

console.log('Using DATABASE_URL:', databaseUrl ? 'Set' : 'Not set');

async function addManagerColumn() {
  const sql = postgres(databaseUrl);
  
  try {
    // Add the manager_id column
    await sql`ALTER TABLE projects ADD COLUMN manager_id INTEGER REFERENCES users(id)`;
    console.log('✅ Successfully added manager_id column to projects table');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ manager_id column already exists');
    } else {
      console.error('❌ Error adding manager_id column:', error);
    }
  } finally {
    await sql.end();
  }
}

addManagerColumn().catch(console.error);
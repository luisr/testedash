import { db } from "./storage";
import { sql } from "drizzle-orm";

export async function setupAuditTable() {
  if (!db) {
    console.error('Database not available');
    return false;
  }

  try {
    console.log('Setting up date_changes_audit table...');
    
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
    return true;
  } catch (error) {
    console.error('Error creating audit table:', error);
    return false;
  }
}
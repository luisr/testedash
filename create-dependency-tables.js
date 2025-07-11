import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function createDependencyTables() {
  try {
    console.log('Creating dependency tables...');
    
    // Create activity dependencies table
    await sql`
      CREATE TABLE IF NOT EXISTS activity_dependencies (
        id SERIAL PRIMARY KEY,
        predecessor_id INTEGER NOT NULL REFERENCES activities(id),
        successor_id INTEGER NOT NULL REFERENCES activities(id),
        dependency_type TEXT NOT NULL DEFAULT 'finish_to_start',
        lag_time INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // Create activity constraints table
    await sql`
      CREATE TABLE IF NOT EXISTS activity_constraints (
        id SERIAL PRIMARY KEY,
        activity_id INTEGER NOT NULL REFERENCES activities(id),
        constraint_type TEXT NOT NULL,
        constraint_date TIMESTAMP NOT NULL,
        priority TEXT DEFAULT 'medium',
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // Add new columns to activities table
    await sql`
      ALTER TABLE activities 
      ADD COLUMN IF NOT EXISTS duration INTEGER,
      ADD COLUMN IF NOT EXISTS buffer_time INTEGER,
      ADD COLUMN IF NOT EXISTS is_auto_scheduled BOOLEAN,
      ADD COLUMN IF NOT EXISTS critical_path BOOLEAN;
    `;
    
    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_activity_dependencies_predecessor ON activity_dependencies(predecessor_id);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_activity_dependencies_successor ON activity_dependencies(successor_id);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_activity_constraints_activity ON activity_constraints(activity_id);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_activities_duration ON activities(duration);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_activities_critical_path ON activities(critical_path);
    `;
    
    console.log('✅ Dependency tables created successfully!');
    
    // Update existing activities with default values
    const activitiesCount = await sql`
      UPDATE activities 
      SET 
        duration = CASE 
          WHEN planned_start_date IS NOT NULL AND planned_end_date IS NOT NULL 
          THEN EXTRACT(DAY FROM (planned_end_date - planned_start_date))::INTEGER
          ELSE 1
        END,
        buffer_time = 0,
        is_auto_scheduled = true,
        critical_path = false
      WHERE duration IS NULL;
    `;
    
    console.log(`✅ Updated ${activitiesCount.count} activities with default values`);
    
    // Add some sample dependencies for testing
    await sql`
      INSERT INTO activity_dependencies (predecessor_id, successor_id, dependency_type, lag_time, is_active)
      SELECT 1, 2, 'finish_to_start', 0, true
      WHERE EXISTS (SELECT 1 FROM activities WHERE id = 1) 
        AND EXISTS (SELECT 1 FROM activities WHERE id = 2)
        AND NOT EXISTS (SELECT 1 FROM activity_dependencies WHERE predecessor_id = 1 AND successor_id = 2);
    `;
    
    await sql`
      INSERT INTO activity_dependencies (predecessor_id, successor_id, dependency_type, lag_time, is_active)
      SELECT 1, 3, 'finish_to_start', 0, true
      WHERE EXISTS (SELECT 1 FROM activities WHERE id = 1) 
        AND EXISTS (SELECT 1 FROM activities WHERE id = 3)
        AND NOT EXISTS (SELECT 1 FROM activity_dependencies WHERE predecessor_id = 1 AND successor_id = 3);
    `;
    
    await sql`
      INSERT INTO activity_dependencies (predecessor_id, successor_id, dependency_type, lag_time, is_active)
      SELECT 2, 4, 'finish_to_start', 0, true
      WHERE EXISTS (SELECT 1 FROM activities WHERE id = 2) 
        AND EXISTS (SELECT 1 FROM activities WHERE id = 4)
        AND NOT EXISTS (SELECT 1 FROM activity_dependencies WHERE predecessor_id = 2 AND successor_id = 4);
    `;
    
    await sql`
      INSERT INTO activity_dependencies (predecessor_id, successor_id, dependency_type, lag_time, is_active)
      SELECT 3, 4, 'finish_to_start', 0, true
      WHERE EXISTS (SELECT 1 FROM activities WHERE id = 3) 
        AND EXISTS (SELECT 1 FROM activities WHERE id = 4)
        AND NOT EXISTS (SELECT 1 FROM activity_dependencies WHERE predecessor_id = 3 AND successor_id = 4);
    `;
    
    console.log('✅ Sample dependencies added!');
    
    // Add some sample constraints for testing
    await sql`
      INSERT INTO activity_constraints (activity_id, constraint_type, constraint_date, priority, description, is_active)
      SELECT 1, 'must_start_on', '2024-01-01 08:00:00', 'high', 'Início obrigatório do projeto', true
      WHERE EXISTS (SELECT 1 FROM activities WHERE id = 1)
        AND NOT EXISTS (SELECT 1 FROM activity_constraints WHERE activity_id = 1 AND constraint_type = 'must_start_on');
    `;
    
    await sql`
      INSERT INTO activity_constraints (activity_id, constraint_type, constraint_date, priority, description, is_active)
      SELECT 4, 'finish_no_later_than', '2024-05-31 17:00:00', 'high', 'Deadline do projeto', true
      WHERE EXISTS (SELECT 1 FROM activities WHERE id = 4)
        AND NOT EXISTS (SELECT 1 FROM activity_constraints WHERE activity_id = 4 AND constraint_type = 'finish_no_later_than');
    `;
    
    console.log('✅ Sample constraints added!');
    
    // Display summary
    const dependenciesCount = await sql`SELECT COUNT(*) FROM activity_dependencies`;
    const constraintsCount = await sql`SELECT COUNT(*) FROM activity_constraints`;
    const activitiesWithDuration = await sql`SELECT COUNT(*) FROM activities WHERE duration IS NOT NULL`;
    
    console.log('\n📊 Database Summary:');
    console.log(`   - Dependencies: ${dependenciesCount[0].count}`);
    console.log(`   - Constraints: ${constraintsCount[0].count}`);
    console.log(`   - Activities with duration: ${activitiesWithDuration[0].count}`);
    
  } catch (error) {
    console.error('❌ Error creating dependency tables:', error);
  } finally {
    await sql.end();
  }
}

createDependencyTables();
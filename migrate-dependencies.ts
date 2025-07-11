import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

// Build DATABASE_URL from individual components
const databaseUrl = process.env.DATABASE_URL || 
  `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

console.log('Built DATABASE_URL from individual components');

// Database connection
const connectionString = databaseUrl;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function migrateDependencies() {
  try {
    console.log('🔄 Starting dependency migration...');
    
    // Create activity dependencies table
    await client`
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
    console.log('✅ Activity dependencies table created');
    
    // Create activity constraints table
    await client`
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
    console.log('✅ Activity constraints table created');
    
    // Add new columns to activities table
    await client`
      ALTER TABLE activities 
      ADD COLUMN IF NOT EXISTS duration INTEGER,
      ADD COLUMN IF NOT EXISTS buffer_time INTEGER,
      ADD COLUMN IF NOT EXISTS is_auto_scheduled BOOLEAN,
      ADD COLUMN IF NOT EXISTS critical_path BOOLEAN;
    `;
    console.log('✅ Added new columns to activities table');
    
    // Create indexes for better performance
    await client`CREATE INDEX IF NOT EXISTS idx_activity_dependencies_predecessor ON activity_dependencies(predecessor_id);`;
    await client`CREATE INDEX IF NOT EXISTS idx_activity_dependencies_successor ON activity_dependencies(successor_id);`;
    await client`CREATE INDEX IF NOT EXISTS idx_activity_constraints_activity ON activity_constraints(activity_id);`;
    await client`CREATE INDEX IF NOT EXISTS idx_activities_duration ON activities(duration);`;
    await client`CREATE INDEX IF NOT EXISTS idx_activities_critical_path ON activities(critical_path);`;
    console.log('✅ Indexes created');
    
    // Update existing activities with default values
    const activitiesResult = await client`
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
    console.log(`✅ Updated ${activitiesResult.count} activities with default values`);
    
    // Add sample dependencies (if activities exist)
    const dependencies = [
      { predecessorId: 1, successorId: 2, dependencyType: 'finish_to_start', lagTime: 0 },
      { predecessorId: 1, successorId: 3, dependencyType: 'finish_to_start', lagTime: 0 },
      { predecessorId: 2, successorId: 4, dependencyType: 'finish_to_start', lagTime: 0 },
      { predecessorId: 3, successorId: 4, dependencyType: 'finish_to_start', lagTime: 0 }
    ];
    
    let dependenciesAdded = 0;
    for (const dep of dependencies) {
      try {
        await client`
          INSERT INTO activity_dependencies (predecessor_id, successor_id, dependency_type, lag_time, is_active)
          SELECT ${dep.predecessorId}, ${dep.successorId}, ${dep.dependencyType}, ${dep.lagTime}, true
          WHERE EXISTS (SELECT 1 FROM activities WHERE id = ${dep.predecessorId}) 
            AND EXISTS (SELECT 1 FROM activities WHERE id = ${dep.successorId})
            AND NOT EXISTS (SELECT 1 FROM activity_dependencies WHERE predecessor_id = ${dep.predecessorId} AND successor_id = ${dep.successorId});
        `;
        dependenciesAdded++;
      } catch (error) {
        console.log(`Note: Could not add dependency ${dep.predecessorId} -> ${dep.successorId}`);
      }
    }
    console.log(`✅ Added ${dependenciesAdded} sample dependencies`);
    
    // Add sample constraints (if activities exist)
    const constraints = [
      { activityId: 1, constraintType: 'must_start_on', constraintDate: '2024-01-01 08:00:00', priority: 'high', description: 'Início obrigatório do projeto' },
      { activityId: 4, constraintType: 'finish_no_later_than', constraintDate: '2024-05-31 17:00:00', priority: 'high', description: 'Deadline do projeto' }
    ];
    
    let constraintsAdded = 0;
    for (const constraint of constraints) {
      try {
        await client`
          INSERT INTO activity_constraints (activity_id, constraint_type, constraint_date, priority, description, is_active)
          SELECT ${constraint.activityId}, ${constraint.constraintType}, ${constraint.constraintDate}, ${constraint.priority}, ${constraint.description}, true
          WHERE EXISTS (SELECT 1 FROM activities WHERE id = ${constraint.activityId})
            AND NOT EXISTS (SELECT 1 FROM activity_constraints WHERE activity_id = ${constraint.activityId} AND constraint_type = ${constraint.constraintType});
        `;
        constraintsAdded++;
      } catch (error) {
        console.log(`Note: Could not add constraint for activity ${constraint.activityId}`);
      }
    }
    console.log(`✅ Added ${constraintsAdded} sample constraints`);
    
    // Display final summary
    const dependenciesCount = await client`SELECT COUNT(*) FROM activity_dependencies`;
    const constraintsCount = await client`SELECT COUNT(*) FROM activity_constraints`;
    const activitiesWithDuration = await client`SELECT COUNT(*) FROM activities WHERE duration IS NOT NULL`;
    const activitiesTotal = await client`SELECT COUNT(*) FROM activities`;
    
    console.log('\n📊 Migration Summary:');
    console.log(`   - Total Activities: ${activitiesTotal[0].count}`);
    console.log(`   - Activities with Duration: ${activitiesWithDuration[0].count}`);
    console.log(`   - Dependencies: ${dependenciesCount[0].count}`);
    console.log(`   - Constraints: ${constraintsCount[0].count}`);
    console.log('\n🎉 Dependency migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDependencies().catch(console.error);
}

export { migrateDependencies };
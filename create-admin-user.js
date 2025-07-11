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

async function createAdminUser() {
  if (!connectionString) {
    console.error('No database connection string available');
    return;
  }

  const client = postgres(connectionString);

  try {
    console.log('🔄 Creating admin user...');
    
    // Hash password for admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const result = await client`
      INSERT INTO users (email, name, role, password_hash, is_active)
      VALUES ('admin@projecthub.com', 'Administrador', 'admin', ${passwordHash}, true)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = ${passwordHash},
        is_active = true
      RETURNING id, email, name, role;
    `;
    
    console.log('✅ Admin user created/updated:', result[0]);
    console.log('📧 Email: admin@projecthub.com');
    console.log('🔑 Senha: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await client.end();
  }
}

createAdminUser();
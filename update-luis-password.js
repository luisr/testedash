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

async function updateLuisPassword() {
  if (!connectionString) {
    console.error('No database connection string available');
    return;
  }

  const client = postgres(connectionString);

  try {
    console.log('🔄 Updating Luis password...');
    
    // Hash password for Luis
    const passwordHash = await bcrypt.hash('Lilian@2019', 10);
    
    // Update Luis password
    const result = await client`
      UPDATE users 
      SET password_hash = ${passwordHash}
      WHERE email = 'luis.ribeiro@beachpark.com.br'
      RETURNING id, email, name, role;
    `;
    
    if (result.length > 0) {
      console.log('✅ Luis password updated:', result[0]);
      console.log('📧 Email: luis.ribeiro@beachpark.com.br');
      console.log('🔑 Nova senha: Lilian@2019');
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await client.end();
  }
}

updateLuisPassword();
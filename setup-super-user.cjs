const { Pool } = require('pg');

async function setupSuperUser() {
  console.log('🔄 Setting up super user...');
  
  // Create connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Add column if it doesn't exist
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_user BOOLEAN DEFAULT false;
    `);
    
    // Set Luis as super user
    const result = await pool.query(`
      UPDATE users 
      SET is_super_user = true 
      WHERE email = 'luis.ribeiro@beachpark.com.br';
    `);
    
    console.log('✅ Super user setup completed!');
    console.log(`Updated ${result.rowCount} user(s)`);
    
    // Verify the change
    const verifyResult = await pool.query(`
      SELECT id, email, name, role, is_super_user 
      FROM users 
      WHERE email = 'luis.ribeiro@beachpark.com.br';
    `);
    
    if (verifyResult.rows.length > 0) {
      console.log('Super user details:', verifyResult.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Error setting up super user:', error);
  } finally {
    await pool.end();
  }
}

setupSuperUser();
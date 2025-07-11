import postgres from 'postgres';

async function addMustChangePasswordColumn() {
  // Build DATABASE_URL from individual components (ignore invalid DATABASE_URL)
  const databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
  
  console.log('Built DATABASE_URL from individual components');
  
  const sql = postgres(databaseUrl, {
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connected to database');

    // Add must_change_password column
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT TRUE;
    `;
    console.log('✅ Added must_change_password column');

    // Update existing users to not require password change
    await sql`
      UPDATE users 
      SET must_change_password = FALSE 
      WHERE email = 'luis.ribeiro@beachpark.com.br';
    `;
    console.log('✅ Updated Luis to not require password change');

    // Update other existing users to not require password change
    await sql`
      UPDATE users 
      SET must_change_password = FALSE 
      WHERE password_hash IS NOT NULL AND created_at < NOW() - INTERVAL '1 day';
    `;
    console.log('✅ Updated existing users to not require password change');

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the migration
addMustChangePasswordColumn().catch(console.error);
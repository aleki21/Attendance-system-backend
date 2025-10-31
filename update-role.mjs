import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_PUBLIC_URL 
});

async function updateRole() {
  try {
    await pool.query("UPDATE users SET role = 'admin' WHERE email = 'alexkimutai021@gmail.com'");
    console.log('✅ User updated to admin role!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
}

updateRole();
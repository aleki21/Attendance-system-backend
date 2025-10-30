import pg from 'pg';
const { Pool } = pg;

console.log('DATABASE_PUBLIC_URL exists:', !!process.env.DATABASE_PUBLIC_URL);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

// Use DATABASE_PUBLIC_URL instead of DATABASE_URL
const pool = new Pool({ 
  connectionString: process.env.DATABASE_PUBLIC_URL
});

async function run() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'usher',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await pool.query(`CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      gender VARCHAR(20),
      age_group VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await pool.query(`CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      type VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await pool.query(`CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      event_id INTEGER,
      member_id INTEGER,
      attended BOOLEAN DEFAULT false,
      check_in_time TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    console.log('✅ All tables created successfully!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
}

run();
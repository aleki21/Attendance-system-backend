import { db } from '../config/db.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🔄 Running database migrations...');
  console.log('🔗 Database URL exists:', !!process.env.DATABASE_PUBLIC_URL || !!process.env.DATABASE_URL);
  
  try {
    // Create users table (matches users.ts schema)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create members table (matches members.ts schema)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS members (
        member_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        age_group VARCHAR(20) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        residence VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create events table (matches events.ts schema)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS events (
        event_id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        event_type VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        auto_generated BOOLEAN DEFAULT false,
        created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create attendance table (matches attendance.ts schema)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS attendance (
        attendance_id SERIAL PRIMARY KEY,
        member_id INTEGER REFERENCES members(member_id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
        status VARCHAR(10) NOT NULL DEFAULT 'present',
        marked_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
        marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
}

export { migrate };
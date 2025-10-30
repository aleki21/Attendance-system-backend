import { db } from '../config/db.js';
import { sql } from 'drizzle-orm';
async function migrate() {
    console.log('🔄 Running database migrations...');
    console.log('🔗 Database URL exists:', !!process.env.DATABASE_URL);
    try {
        // Create users table
        await db.execute(sql `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'usher',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create members table
        await db.execute(sql `
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        gender VARCHAR(20),
        age_group VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create events table
        await db.execute(sql `
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create attendance table
        await db.execute(sql `
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id),
        member_id INTEGER REFERENCES members(id),
        attended BOOLEAN DEFAULT false,
        check_in_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ Database tables created successfully!');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}
// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrate();
}
export { migrate };

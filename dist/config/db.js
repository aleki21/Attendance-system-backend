import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema/index.js';
// Simple database configuration
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ DATABASE_URL is missing');
    // Don't throw error, just log so we can debug
}
console.log('🔗 Database config loaded');
const pool = new Pool({
    connectionString: connectionString,
    ssl: connectionString?.includes('railway') ? { rejectUnauthorized: false } : false
});
export const db = drizzle(pool, { schema });
export default pool;

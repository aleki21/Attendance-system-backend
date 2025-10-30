import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema/index.js';

// Use DATABASE_PUBLIC_URL for Railway
const connectionString = process.env.DATABASE_PUBLIC_URL;

console.log('🔗 Database PUBLIC URL exists:', !!connectionString);

if (!connectionString) {
  console.error('❌ DATABASE_PUBLIC_URL is missing');
}

const pool = new Pool({
  connectionString: connectionString,
});

export const db = drizzle(pool, { schema });
export default pool;
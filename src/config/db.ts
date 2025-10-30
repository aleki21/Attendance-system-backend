import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema/index.js';

const connectionString = process.env.DATABASE_URL;

console.log('🔗 Database URL exists:', !!connectionString);

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false } // Required for Railway
});

export const db = drizzle(pool, { schema });
export default pool;
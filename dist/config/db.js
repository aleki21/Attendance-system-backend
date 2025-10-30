import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema/index.js';
import { dbConfig } from './production.js';
const pool = new Pool(dbConfig);
export const db = drizzle(pool, { schema });
export default pool;

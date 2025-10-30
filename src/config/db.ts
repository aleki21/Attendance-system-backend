<<<<<<< HEAD
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema/index.js';
import { dbConfig } from './production.js';

const pool = new Pool(dbConfig);

export const db = drizzle(pool, { schema });

export default pool;
=======
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ✅ Single db export, always use this
export const db = drizzle(pool);
>>>>>>> 8a171ee12859883c053bf80139b1627c2984a30d

import { PoolConfig } from 'pg';

export const dbConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  // No SSL for local development
};
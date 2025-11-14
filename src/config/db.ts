import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema/index.js';

function getDatabaseConfig() {
  // For Railway production
  if (process.env.DATABASE_PUBLIC_URL) {
    console.log('🚀 Using production database (Railway)');
    return {
      connectionString: process.env.DATABASE_PUBLIC_URL,
      ssl: { rejectUnauthorized: false }
    };
  }
  
  // For local development - parse DATABASE_URL or use defaults
  if (process.env.DATABASE_URL) {
    try {
      // Parse the connection string manually
      const url = new URL(process.env.DATABASE_URL);
      console.log('💻 Using development database (Parsed from DATABASE_URL)');
      return {
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.replace('/', ''), // Remove leading slash
        user: url.username,
        password: url.password,
        ssl: false
      };
    } catch (error) {
      console.error('❌ Failed to parse DATABASE_URL, using defaults:', error);
    }
  }
  
  // Fallback to individual environment variables or defaults
  console.log('💻 Using development database (Default settings)');
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'church_attendance',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'kerets021',
    ssl: false
  };
}

const config = getDatabaseConfig();
console.log('🔗 Database config:', { 
  ...config, 
  password: config.password ? '***' + config.password.slice(-3) : 'none' 
});

const pool = new Pool(config);

// Connection event handlers
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    console.log('✅ Database connection test passed:', result.rows[0].time);
    client.release();
  } catch (error: any) {
    console.error('❌ Database connection test failed:', error.message);
    console.log('💡 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check if database "church_attendance" exists');
    console.log('3. Verify username/password are correct');
    console.log('4. Try: psql -h localhost -U postgres -c "CREATE DATABASE church_attendance;"');
  }
};

testConnection();

export const db = drizzle(pool, { schema });
export default pool;
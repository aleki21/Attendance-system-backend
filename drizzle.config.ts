import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema/*.js',
  out: './drizzle',
  dialect: 'postgresql',
} satisfies Config;
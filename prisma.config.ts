// prisma.config.ts - Controls the Prisma CLI (migrate, generate, db seed, etc.)
// Uses DIRECT_URL so that migrations bypass PgBouncer (port 5432, not 6543)
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // ts-node executes seed.ts directly in CommonJS-compatible mode
    seed: 'ts-node --compiler-options {"module":"commonjs"} prisma/seed.ts',
  },
  datasource: {
    // CLI uses DIRECT connection (port 5432) — bypasses PgBouncer advisory lock restrictions
    url: process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'],
  },
});

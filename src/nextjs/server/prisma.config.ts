// Prisma classic (v7) config. `schema` points at the `prisma/` folder so the
// multi-file schema (schema.prisma + serene-core.prisma + next-auth.prisma)
// composes into one client.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL']!,
  },
});

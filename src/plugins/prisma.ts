import fp from 'fastify-plugin';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../../generated/prisma/client';
import { env } from '../config/env';

export default fp(
  async (app) => {
    const adapter = new PrismaBetterSqlite3({ url: env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter });

    await prisma.$connect();

    app.decorate('prisma', prisma);

    app.addHook('onClose', async () => {
      await prisma.$disconnect();
    });
  },
  { name: 'prisma' },
);

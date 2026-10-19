import 'reflect-metadata';
import Fastify, { type FastifyServerOptions } from 'fastify';
import { isProduction } from './config/env';
import { errorHandler } from './common/errors/error-handler';
import { NotFoundError } from './common/errors/app-error';
import prismaPlugin from './plugins/prisma';
import securityPlugin from './plugins/security';
import authPlugin from './plugins/auth';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';

export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: isProduction ? true : { level: 'info' },
    ...options,
  });

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(() => {
    throw new NotFoundError('Rota não encontrada');
  });

  await app.register(securityPlugin);
  await app.register(prismaPlugin);
  await app.register(authPlugin);

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(usersRoutes, { prefix: '/users' });

  return app;
}

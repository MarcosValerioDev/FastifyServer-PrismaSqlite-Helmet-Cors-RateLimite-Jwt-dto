import 'reflect-metadata';
import Fastify, { type FastifyServerOptions } from 'fastify';
import { env, isProduction } from './config/env';
import { errorHandler } from './common/errors/error-handler';
import { NotFoundError } from './common/errors/app-error';
import prismaPlugin from './plugins/prisma';
import securityPlugin from './plugins/security';
import authPlugin from './plugins/auth';
import swaggerPlugin from './plugins/swagger';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';

export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: isProduction ? true : { level: 'info' },
    ...options,
  });

  // Os `schema` das rotas servem só para documentação (Swagger).
  // A validação é feita pelos DTOs (class-validator) e a serialização por JSON.stringify.
  app.setValidatorCompiler(() => (data) => ({ value: data }));
  app.setSerializerCompiler(() => (data) => JSON.stringify(data));

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(() => {
    throw new NotFoundError('Rota não encontrada');
  });

  await app.register(securityPlugin);
  await app.register(prismaPlugin);
  await app.register(authPlugin);
  if (env.DOCS_ENABLED) {
    await app.register(swaggerPlugin);
  }

  app.get(
    '/health',
    { schema: { tags: ['Health'], summary: 'Status do servidor' } },
    async () => ({ status: 'ok', timestamp: new Date().toISOString() }),
  );

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(usersRoutes, { prefix: '/users' });

  return app;
}

import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env';
import { UnauthorizedError } from '../common/errors/app-error';

export default fp(
  async (app) => {
    await app.register(jwt, {
      secret: env.JWT_SECRET,
      sign: { expiresIn: env.JWT_EXPIRES_IN },
    });

    app.decorate(
      'authenticate',
      async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
        try {
          await request.jwtVerify();
        } catch {
          throw new UnauthorizedError('Token inválido ou ausente');
        }
      },
    );
  },
  { name: 'auth' },
);

import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { dtoSchemas } from '../common/docs/openapi';
import { env } from '../config/env';

export default fp(
  async (app) => {
    await app.register(swagger, {
      openapi: {
        openapi: '3.0.3',
        info: {
          title: 'Fastify Server API',
          description:
            'API com Fastify, Prisma (SQLite), JWT, Helmet, CORS, Rate Limit e validação via DTO (class-validator).',
          version: '1.0.0',
        },
        servers: [{ url: `http://localhost:${env.PORT}`, description: 'Local' }],
        tags: [
          { name: 'Health', description: 'Status do servidor' },
          { name: 'Auth', description: 'Cadastro e login' },
          { name: 'Users', description: 'Usuários (requer JWT)' },
        ],
        components: {
          securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          },
          // Schemas gerados a partir dos DTOs (class-validator-jsonschema)
          schemas: dtoSchemas() as never,
        },
      },
    });

    await app.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: { docExpansion: 'list', persistAuthorization: true },
      // Aplica a CSP própria do Swagger UI no lugar da CSP padrão do Helmet
      staticCSP: true,
    });
  },
  { name: 'swagger' },
);

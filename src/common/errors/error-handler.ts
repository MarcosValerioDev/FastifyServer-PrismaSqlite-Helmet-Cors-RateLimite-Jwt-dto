import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '../../../generated/prisma/client';
import { AppError } from './app-error';
import { isProduction } from '../../config/env';

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
      ...(error.details !== undefined && { details: error.details }),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return reply.status(409).send({
        statusCode: 409,
        error: 'ConflictError',
        message: 'Registro já existe',
      });
    }
    if (error.code === 'P2025') {
      return reply.status(404).send({
        statusCode: 404,
        error: 'NotFoundError',
        message: 'Recurso não encontrado',
      });
    }
  }

  // Erros nativos do Fastify/plugins (rate limit 429, payload inválido 400, etc.)
  const statusCode = (error as FastifyError).statusCode;
  if (statusCode && statusCode < 500) {
    return reply.status(statusCode).send({
      statusCode,
      error: error.name,
      message: error.message,
    });
  }

  request.log.error(error);
  return reply.status(500).send({
    statusCode: 500,
    error: 'InternalServerError',
    message: isProduction ? 'Erro interno do servidor' : error.message,
  });
}

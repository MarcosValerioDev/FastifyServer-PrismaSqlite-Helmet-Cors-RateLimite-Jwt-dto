import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';
import type { FastifyRequest } from 'fastify';
import { BadRequestError } from '../errors/app-error';

type RequestSource = 'body' | 'params' | 'query';

function formatErrors(errors: ValidationError[], parent = ''): Record<string, string[]> {
  return errors.reduce<Record<string, string[]>>((acc, error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    if (error.constraints) {
      acc[path] = Object.values(error.constraints);
    }
    if (error.children?.length) {
      Object.assign(acc, formatErrors(error.children, path));
    }
    return acc;
  }, {});
}

/**
 * Converte o objeto puro em instância do DTO, valida com class-validator
 * e substitui `request[source]` pela instância validada.
 * Use como `preValidation` nas rotas.
 */
export function validateDto<T extends object>(dto: ClassConstructor<T>, source: RequestSource = 'body') {
  return async (request: FastifyRequest): Promise<void> => {
    const instance = plainToInstance(dto, request[source] ?? {});
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new BadRequestError('Erro de validação', formatErrors(errors));
    }

    (request as unknown as Record<RequestSource, unknown>)[source] = instance;
  };
}

import type { FastifySchema } from 'fastify';
import { arrayOf, bearerAuth, inline, ref } from '../../common/docs/openapi';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

// Schemas apenas para documentação (Swagger) — a validação é feita pelos DTOs.
const error = ref(ErrorResponseDto);
const tags = ['Users'];
const security = bearerAuth;

export const meSchema: FastifySchema = {
  tags,
  security,
  summary: 'Dados do usuário logado',
  response: { 200: ref(UserResponseDto), 401: error },
};

export const findAllSchema: FastifySchema = {
  tags,
  security,
  summary: 'Lista usuários',
  response: { 200: arrayOf(UserResponseDto), 401: error },
};

export const findByIdSchema = (): FastifySchema => ({
  tags,
  security,
  summary: 'Busca usuário por id',
  params: inline(IdParamDto),
  response: { 200: ref(UserResponseDto), 400: error, 401: error, 404: error },
});

export const updateSchema = (): FastifySchema => ({
  tags,
  security,
  summary: 'Atualiza o próprio usuário',
  params: inline(IdParamDto),
  body: ref(UpdateUserDto),
  response: { 200: ref(UserResponseDto), 400: error, 401: error, 403: error, 404: error, 409: error },
});

export const deleteSchema = (): FastifySchema => ({
  tags,
  security,
  summary: 'Remove o próprio usuário',
  params: inline(IdParamDto),
  response: { 204: { type: 'null', description: 'Removido' }, 400: error, 401: error, 403: error, 404: error },
});

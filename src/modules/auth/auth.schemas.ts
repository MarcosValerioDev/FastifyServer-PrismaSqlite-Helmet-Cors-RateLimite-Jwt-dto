import type { FastifySchema } from 'fastify';
import { ref } from '../../common/docs/openapi';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Schemas apenas para documentação (Swagger) — a validação é feita pelos DTOs.
const error = ref(ErrorResponseDto);

export const registerSchema: FastifySchema = {
  tags: ['Auth'],
  summary: 'Cadastra um usuário e retorna o token',
  body: ref(RegisterDto),
  response: { 201: ref(AuthResponseDto), 400: error, 409: error, 429: error },
};

export const loginSchema: FastifySchema = {
  tags: ['Auth'],
  summary: 'Autentica e retorna o token',
  body: ref(LoginDto),
  response: { 200: ref(AuthResponseDto), 400: error, 401: error, 429: error },
};

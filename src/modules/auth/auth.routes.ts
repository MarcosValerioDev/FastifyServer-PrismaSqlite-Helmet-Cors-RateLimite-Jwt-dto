import type { FastifyInstance } from 'fastify';
import { validateDto } from '../../common/validation/validate-dto';
import { UsersRepository } from '../users/users.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Limite mais restrito para rotas sensíveis (força bruta)
const authRateLimit = { rateLimit: { max: 5, timeWindow: '1 minute' } };

export async function authRoutes(app: FastifyInstance) {
  const controller = new AuthController(
    new AuthService(new UsersRepository(app.prisma), app.jwt),
  );

  app.post(
    '/register',
    { config: authRateLimit, preValidation: [validateDto(RegisterDto)] },
    controller.register,
  );
  app.post(
    '/login',
    { config: authRateLimit, preValidation: [validateDto(LoginDto)] },
    controller.login,
  );
}

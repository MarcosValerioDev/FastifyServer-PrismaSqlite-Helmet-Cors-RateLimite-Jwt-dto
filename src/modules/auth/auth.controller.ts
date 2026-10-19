import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (request: FastifyRequest<{ Body: RegisterDto }>, reply: FastifyReply) => {
    const result = await this.authService.register(request.body);
    return reply.status(201).send(result);
  };

  login = async (request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply) => {
    const result = await this.authService.login(request.body);
    return reply.send(result);
  };
}

import type { FastifyInstance } from 'fastify';
import { ConflictError, UnauthorizedError } from '../../common/errors/app-error';
import { comparePassword, hashPassword } from '../../common/security/password';
import { UsersRepository } from '../users/users.repository';
import { UserResponseDto } from '../users/dto/user-response.dto';
import type { User } from '../../../generated/prisma/client';
import { AuthResponseDto } from './dto/auth-response.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwt: FastifyInstance['jwt'],
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictError('E-mail já cadastrado');

    const user = await this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
    });

    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findByEmail(dto.email);
    const valid = user ? await comparePassword(dto.password, user.passwordHash) : false;

    if (!user || !valid) throw new UnauthorizedError('Credenciais inválidas');

    return this.buildResponse(user);
  }

  private buildResponse(user: User): AuthResponseDto {
    const response = new AuthResponseDto();
    response.accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    response.user = UserResponseDto.fromEntity(user);
    return response;
  }
}

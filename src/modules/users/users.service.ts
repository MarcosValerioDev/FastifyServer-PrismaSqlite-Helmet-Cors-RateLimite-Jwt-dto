import type { Prisma } from '../../../generated/prisma/client';
import { ConflictError, ForbiddenError, NotFoundError } from '../../common/errors/app-error';
import { hashPassword } from '../../common/security/password';
import { UsersRepository } from './users.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll();
    return users.map(UserResponseDto.fromEntity);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundError('Usuário não encontrado');
    return UserResponseDto.fromEntity(user);
  }

  async update(id: string, currentUserId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    this.ensureOwner(id, currentUserId);
    await this.findById(id);

    const data: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) {
      const existing = await this.usersRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) throw new ConflictError('E-mail já cadastrado');
      data.email = dto.email;
    }
    if (dto.password !== undefined) data.passwordHash = await hashPassword(dto.password);

    const user = await this.usersRepository.update(id, data);
    return UserResponseDto.fromEntity(user);
  }

  async delete(id: string, currentUserId: string): Promise<void> {
    this.ensureOwner(id, currentUserId);
    await this.findById(id);
    await this.usersRepository.delete(id);
  }

  private ensureOwner(id: string, currentUserId: string): void {
    if (id !== currentUserId) {
      throw new ForbiddenError('Você só pode alterar o próprio usuário');
    }
  }
}

import { IsDate, IsEmail, IsString, IsUUID } from 'class-validator';
import type { User } from '../../../../generated/prisma/client';

/**
 * Representação pública do usuário — nunca expõe o passwordHash.
 * Os decorators servem para gerar o schema do Swagger.
 */
export class UserResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}

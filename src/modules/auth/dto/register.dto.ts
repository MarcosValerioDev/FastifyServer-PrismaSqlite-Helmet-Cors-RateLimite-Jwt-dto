import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'name deve ser texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(2, 100, { message: 'name deve ter entre 2 e 100 caracteres' })
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'email inválido' })
  email: string;

  @IsString({ message: 'password deve ser texto' })
  @IsNotEmpty({ message: 'password é obrigatório' })
  @MinLength(8, { message: 'password deve ter pelo menos 8 caracteres' })
  @MaxLength(72, { message: 'password deve ter no máximo 72 caracteres' })
  password: string;
}

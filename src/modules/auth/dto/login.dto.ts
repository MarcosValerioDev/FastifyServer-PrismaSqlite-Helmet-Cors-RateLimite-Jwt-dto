import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'email inválido' })
  email: string;

  @IsString({ message: 'password deve ser texto' })
  @IsNotEmpty({ message: 'password é obrigatório' })
  password: string;
}

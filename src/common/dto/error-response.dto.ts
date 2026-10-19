import { IsInt, IsObject, IsOptional, IsString } from 'class-validator';

/** Formato padrão de erro — usado apenas para documentação (Swagger). */
export class ErrorResponseDto {
  @IsInt()
  statusCode: number;

  @IsString()
  error: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, string[]>;
}

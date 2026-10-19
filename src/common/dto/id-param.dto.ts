import { IsUUID } from 'class-validator';

export class IdParamDto {
  @IsUUID('all', { message: 'id deve ser um UUID válido' })
  id: string;
}

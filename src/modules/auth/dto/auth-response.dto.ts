import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  @IsString()
  accessToken: string;

  @ValidateNested()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}

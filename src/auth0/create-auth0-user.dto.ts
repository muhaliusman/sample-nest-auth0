import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuth0UserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  email_verified: boolean;

  @IsOptional()
  name?: string | null;

  @IsOptional()
  picture?: string | null;

  @IsString()
  user_id: string;
}

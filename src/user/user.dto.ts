import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class UpdateUserNameDto {
  @IsString()
  @ApiProperty({
    description: 'Name of user',
    required: true,
    example: 'John Doe',
  })
  name: string;
}

export class UpdatePasswordDto {
  @IsStrongPassword()
  @ApiProperty({
    description: 'Must be a strong password',
    required: true,
    example: 'P@ssw0rd!',
  })
  password: string;
}

export class Auth0UserDto {
  @IsEmail()
  @ApiProperty({
    description: 'Auth0 email',
    required: true,
    example: 'johndoe@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'Auth0 email_verified',
    required: true,
    example: true,
  })
  @IsNotEmpty()
  email_verified: boolean;

  @ApiPropertyOptional({
    description: 'Auth0 name',
    example: 'John Doe',
  })
  @IsOptional()
  name?: string | null;

  @ApiPropertyOptional({
    description: 'Auth0 name',
    example: 'https://sampleimage.com/sample.jpg',
  })
  @IsOptional()
  picture?: string | null;

  @ApiPropertyOptional({
    description: 'Last login date',
    example: '2021-01-01T00:00:00.000Z',
  })
  @IsOptional()
  last_login_at?: Date | null;

  @ApiProperty({
    description: 'Auth0 user_id',
    required: true,
    example: 'auth0|1234567890',
  })
  @IsString()
  user_id: string;
}

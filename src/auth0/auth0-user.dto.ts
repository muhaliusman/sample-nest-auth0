import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuth0UserDto {
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

  @ApiProperty({
    description: 'Auth0 user_id',
    required: true,
    example: 'auth0|1234567890',
  })
  @IsString()
  user_id: string;
}

export class UpdateLastLoginDto {
  @ApiProperty({
    description: 'Auth0 user_id',
    required: true,
    example: 'auth0|1234567890',
  })
  @IsString()
  user_id: string;
}

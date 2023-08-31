import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from './jwt.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  exports: [PassportModule],
  providers: [JwtService],
})
export class Auth0Module {}

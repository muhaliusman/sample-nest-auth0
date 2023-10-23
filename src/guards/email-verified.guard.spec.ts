import { Test, TestingModule } from '@nestjs/testing';
import { EmailVerifiedGuard } from './email-verified.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserService } from 'user/user.service';
import { Auth0AccessTokenDecoded } from 'auth0/auth0.type';
import { User } from 'user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Auth0Service } from 'auth0/auth0.service';

describe('EmailVerifiedGuard', () => {
  let guard: EmailVerifiedGuard;
  let userService: UserService;

  const tokenDecoded: Auth0AccessTokenDecoded = {
    aud: ['aud'],
    exp: 1234567890,
    iat: 1234567890,
    azp: 'azp',
    iss: 'iss',
    scope: 'scope',
    sub: 'auth0|1234567890',
  };

  const user = new User();
  user.auth0_id = tokenDecoded.sub;
  user.email_verified = true;
  user.name = 'name';
  user.avatar = 'picture';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerifiedGuard,
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: jest.fn(),
        },
        {
          provide: Auth0Service,
          useValue: jest.fn(),
        },
      ],
    }).compile();

    guard = module.get<EmailVerifiedGuard>(EmailVerifiedGuard);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access for user with verified email', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: tokenDecoded,
        }),
      }),
    } as ExecutionContext;

    jest.spyOn(userService, 'getUserByAuth0Id').mockResolvedValue(user);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny access for user with unverified email', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: tokenDecoded,
        }),
      }),
    } as ExecutionContext;

    user.email_verified = false;

    jest.spyOn(userService, 'getUserByAuth0Id').mockResolvedValue(user);

    try {
      await guard.canActivate(context);
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toBe('Email not verified');
      expect(error.getResponse()).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Email not verified',
        type: 'EmailNotVerified',
      });
    }
  });
});

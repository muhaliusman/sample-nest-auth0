import { Test, TestingModule } from '@nestjs/testing';
import { Auth0WhitelistGuard } from './auth0-whitelist.guard';
import { ConfigService } from '@nestjs/config';

describe('Auth0WhitelistGuard', () => {
  let guard: Auth0WhitelistGuard;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Auth0WhitelistGuard,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<Auth0WhitelistGuard>(Auth0WhitelistGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access for whitelisted IP', async () => {
    // Mock the IP whitelist configuration
    mockConfigService.get.mockReturnValue('127.0.0.1,192.168.1.1');

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          connection: {
            remoteAddress: '127.0.0.1', // Whitelisted IP
          },
        }),
      }),
    } as any;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny access for non-whitelisted IP', async () => {
    // Mock the IP whitelist configuration
    mockConfigService.get.mockReturnValue('127.0.0.1,192.168.1.1');

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          connection: {
            remoteAddress: '10.0.0.1', // Non-whitelisted IP
          },
        }),
      }),
    } as any;

    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should deny access if IP whitelist is empty', async () => {
    // Mock an empty IP whitelist
    mockConfigService.get.mockReturnValue('');

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          connection: {
            remoteAddress: '10.0.0.1', // Any IP
          },
        }),
      }),
    } as any;

    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });
});

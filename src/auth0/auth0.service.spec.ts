import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { of, throwError } from 'rxjs';
import { Auth0Service } from './auth0.service';
import { NotFoundException } from '@nestjs/common';

const mockConfigService = {
  get: jest.fn(),
};

const mockHttpService = {
  post: jest.fn(),
  get: jest.fn(),
  patch: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('Auth0Service', () => {
  let auth0Service: Auth0Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Auth0Service,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    auth0Service = module.get<Auth0Service>(Auth0Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccessToken', () => {
    it('should return access token from cache if available', async () => {
      mockConfigService.get.mockReturnValueOnce('clientId');
      mockConfigService.get.mockReturnValueOnce('clientSecret');
      mockConfigService.get.mockReturnValueOnce('audience');

      mockCacheManager.get.mockResolvedValueOnce('cachedAccessToken');

      const result = await auth0Service.getAccessToken();

      expect(result).toBe('cachedAccessToken');
      expect(mockHttpService.post).not.toBeCalled();
    });

    it('should fetch and cache access token if not available in cache', async () => {
      mockConfigService.get.mockReturnValueOnce('clientId');
      mockConfigService.get.mockReturnValueOnce('clientSecret');
      mockConfigService.get.mockReturnValueOnce('audience');

      mockCacheManager.get.mockResolvedValueOnce(undefined);

      const response = {
        data: {
          access_token: 'newAccessToken',
          expires_in: 3600,
        },
      };

      mockHttpService.post.mockReturnValueOnce(of(response));

      const result = await auth0Service.getAccessToken();

      expect(result).toBe('newAccessToken');
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'clientId-clientSecret-audience',
        'newAccessToken',
        {
          ttl: 3600,
        },
      );
    });

    it('should throw an error if HTTP request fails', async () => {
      mockConfigService.get.mockReturnValueOnce('clientId');
      mockConfigService.get.mockReturnValueOnce('clientSecret');
      mockConfigService.get.mockReturnValueOnce('audience');

      mockCacheManager.get.mockResolvedValueOnce(undefined);

      const error = new Error('HTTP request failed');
      mockHttpService.post.mockReturnValueOnce(throwError(() => error));

      await expect(auth0Service.getAccessToken()).rejects.toThrowError(error);
    });
  });

  describe('getAuth0User', () => {
    it('should fetch and return Auth0 user data', async () => {
      // Mock config and access token
      mockConfigService.get.mockReturnValueOnce('auth0-issuer');
      const accessToken = 'mockAccessToken';
      jest.spyOn(auth0Service, 'getAccessToken')
        .mockResolvedValue(accessToken);

      const response = {
        data: {
          user_id: 'auth0|userId',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      };

      mockHttpService.get.mockReturnValueOnce(of(response));

      const result = await auth0Service.getAuth0User('userId');

      expect(result).toEqual(response.data);
      expect(mockHttpService.get).toHaveBeenCalledWith('api/v2/users/userId', {
        baseURL: 'auth0-issuer',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    });

    it('should throw an error if HTTP request fails', async () => {
      // Mock config and access token
      mockConfigService.get.mockReturnValueOnce('auth0-issuer');
      const accessToken = 'mockAccessToken';
      jest.spyOn(auth0Service, 'getAccessToken')
        .mockResolvedValue(accessToken);

      const error = new Error('HTTP request failed');
      mockHttpService.get.mockReturnValueOnce(throwError(() => error));

      await expect(auth0Service.getAuth0User('userId')).rejects.toThrowError(
        error
      );
    });
  });

  describe('updateUser', () => {
    it('should update and return Auth0 user data', async () => {
      // Mock config, access token, and canUpdateAuth0Data
      mockConfigService.get.mockReturnValueOnce('clientId');
      mockConfigService.get.mockReturnValueOnce('clientSecret');
      mockConfigService.get.mockReturnValueOnce('audience');
      mockConfigService.get.mockReturnValueOnce('auth0-issuer');

      const accessToken = 'mockAccessToken';

      // Mock the getAccessToken method to return a specific value
      const getAccessTokenMock = jest
        .spyOn(auth0Service, 'getAccessToken')
        .mockResolvedValue(accessToken);

      // Mock the canUpdateAuth0Data method to return true
      const canUpdateAuth0DataMock = jest
        .spyOn(auth0Service, 'canUpdateAuth0Data')
        .mockReturnValue(true);

      const response = {
        data: {
          // Updated user data here
        },
      };

      mockHttpService.patch.mockReturnValueOnce(of(response));

      const result = await auth0Service.updateUser('userId', {});

      expect(result).toEqual(response.data);
      expect(mockHttpService.patch).toHaveBeenCalledWith(
        'api/v2/users/userId',
        {},
        {
          baseURL: 'auth0-issuer',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Restore the original implementations
      getAccessTokenMock.mockRestore();
      canUpdateAuth0DataMock.mockRestore();
    });

    it('should throw a BadRequestException if cannot update Auth0 data', async () => {
      // Mock config, access token, and canUpdateAuth0Data to return false
      mockConfigService.get.mockReturnValueOnce('clientId');
      mockConfigService.get.mockReturnValueOnce('clientSecret');
      mockConfigService.get.mockReturnValueOnce('audience');
      mockConfigService.get.mockReturnValueOnce('auth0-issuer');

      const accessToken = 'mockAccessToken';

      // Mock the getAccessToken method to return a specific value
      const getAccessTokenMock = jest
        .spyOn(auth0Service, 'getAccessToken')
        .mockResolvedValue(accessToken);

      // Mock the canUpdateAuth0Data method to return false
      const canUpdateAuth0DataMock = jest
        .spyOn(auth0Service, 'canUpdateAuth0Data')
        .mockReturnValue(false);

      await expect(auth0Service.updateUser('userId', {})).rejects.toThrowError(
        BadRequestException
      );

      // Restore the original implementations
      getAccessTokenMock.mockRestore();
      canUpdateAuth0DataMock.mockRestore();
    });

    it('should throw an error if HTTP request fails', async () => {
      // Mock config, access token, and canUpdateAuth0Data
      mockConfigService.get.mockReturnValueOnce('clientId');
      mockConfigService.get.mockReturnValueOnce('clientSecret');
      mockConfigService.get.mockReturnValueOnce('audience');
      mockConfigService.get.mockReturnValueOnce('auth0-issuer');

      const accessToken = 'mockAccessToken';

      // Mock the getAccessToken method to return a specific value
      const getAccessTokenMock = jest
        .spyOn(auth0Service, 'getAccessToken')
        .mockResolvedValue(accessToken);

      // Mock the canUpdateAuth0Data method to return true
      const canUpdateAuth0DataMock = jest
        .spyOn(auth0Service, 'canUpdateAuth0Data')
        .mockReturnValue(true);

      const error = new Error('HTTP request failed');
      mockHttpService.patch.mockReturnValueOnce(throwError(error));

      await expect(auth0Service.updateUser('userId', {})).rejects.toThrowError(
        error
      );

      // Restore the original implementations
      getAccessTokenMock.mockRestore();
      canUpdateAuth0DataMock.mockRestore();
    });
  });
});
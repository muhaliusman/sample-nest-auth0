import { HttpException } from '@nestjs/common';
import { ResponseHelper } from './response.helper';

describe('ResponseHelper', () => {
  describe('throwHttpException', () => {
    it('should throw the provided HttpException', () => {
      const error = new HttpException('Test error', 400);

      expect(() => ResponseHelper.throwHttpException(error, 500)).toThrow(error);
    });

    it('should throw a new HttpException with the provided status code and error message', () => {
      const statusCode = 500;
      const errorMessage = 'Custom error message';

      expect(() => ResponseHelper.throwHttpException(new Error(errorMessage), statusCode)).toThrowError(HttpException);
    });
  });

  describe('generalSuccessResponse', () => {
    it('should return a general success response with the provided message', () => {
      const message = 'Success message';
      const response = ResponseHelper.generalSuccessResponse(message);

      expect(response).toEqual({
        status: 'success',
        message,
      });
    });
  });
});
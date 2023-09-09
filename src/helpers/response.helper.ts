import { HttpException } from '@nestjs/common';
import { GeneralSuccessResponse } from './response.type';
export class ResponseHelper {
  static throwHttpException(error: Error, statusCode: number): never {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new HttpException(
      {
        status: statusCode,
        error: error.message,
      },
      statusCode,
    );
  }

  static generalSuccessResponse(message: string): GeneralSuccessResponse {
    return {
      status: 'success',
      message,
    };
  }
}

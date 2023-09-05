import { HttpException } from '@nestjs/common';

export class ResponseHelper {
  static throwHttpException(error: Error, statusCode: number) {
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
}

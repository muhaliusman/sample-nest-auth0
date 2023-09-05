import { HttpException } from '@nestjs/common';

export class ResponseHelper {
  static generateSuccessResponse(
    data: any,
    message?: string,
  ): { status: string; data: any; message: string } {
    return {
      status: 'success',
      data,
      message,
    };
  }

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

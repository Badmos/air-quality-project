import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger as logger,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let statusCode, resObj, message;
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      resObj = exception.getResponse();
      message = resObj.message;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      resObj = exception;
      message = 'An error occured while attempting to process your request';
    }
    logger.error(`Internal error`, resObj);

    return response.status(statusCode).json({ message, data: null });
  }
}

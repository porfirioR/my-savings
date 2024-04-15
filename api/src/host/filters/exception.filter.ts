import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { JsonWebTokenError } from '@nestjs/jwt';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let status: number = 0
    switch (true) {
      case exception instanceof HttpException:
        status = exception.getStatus();
        break;
      case exception instanceof JsonWebTokenError:
        status = HttpStatus.UNAUTHORIZED;
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        break;
      case exception instanceof BadRequestException:
        status = HttpStatus.BAD_REQUEST;
        break;
    }

    response.status(status).json({
      status: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: (exception as any).message
    });
  }
}

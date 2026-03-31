import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      message =
        typeof exResponse === 'string'
          ? exResponse
          : (exResponse as any).message;
    } else if (exception instanceof Error) {
      this.logger.error(
        `${request.method} ${request.url} → ${exception.message}`,
      );
      message = exception.message;
    }

    // Report unexpected errors and 5xx to Sentry
    const shouldReport =
      !(exception instanceof HttpException) || status >= 500;

    if (shouldReport) {
      Sentry.withScope((scope) => {
        scope.setTag(
          'requestId',
          (request.headers['x-request-id'] as string) ?? 'unknown',
        );
        scope.setExtra('url', request.url);
        scope.setExtra('method', request.method);
        scope.setExtra('statusCode', status);

        if (exception instanceof Error) {
          Sentry.captureException(exception);
        } else {
          Sentry.captureException(new Error(String(exception)));
        }
      });
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      ...(request.headers['x-request-id']
        ? { requestId: request.headers['x-request-id'] }
        : {}),
    });
  }
}

import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

@Module({})
export class SentryModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const dsn = this.configService.get<string>('SENTRY_DSN');

    if (!dsn) {
      return; // Sentry disabled — no DSN configured
    }

    Sentry.init({
      dsn,
      environment: this.configService.get('NODE_ENV', 'development'),
      tracesSampleRate:
        this.configService.get('NODE_ENV') === 'production' ? 0.1 : 1.0,
      beforeSend(event) {
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });
  }
}

import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            genReqId: (req: IncomingMessage) => {
              const existingId = (req.headers['x-request-id'] as string) ?? '';
              return existingId || randomUUID();
            },
            autoLogging: true,
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.body.token',
                'req.body.refreshToken',
              ],
              censor: '[REDACTED]',
            },
            level: isProduction ? 'info' : 'debug',
            customSuccessMessage: (req: any, res: any, responseTime: number) => {
              return `${req.method} ${req.url} → ${res.statusCode} (${Math.round(responseTime)}ms)`;
            },
            customErrorMessage: (req: any, res: any, error: any) => {
              return `${req.method} ${req.url} → ${res.statusCode} | ${error?.message ?? 'error'}`;
            },
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:HH:MM:ss',
                    ignore: 'pid,hostname,req,res,responseTime,context',
                  },
                },
            serializers: {
              req: () => undefined,
              res: () => undefined,
            },
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class AppLoggerModule {}

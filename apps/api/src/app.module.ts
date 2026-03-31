import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { DatabaseModule } from './config/database.module';
import { RedisModule } from './config/redis.module';
import { QueueModule } from './config/queue.module';
import { AppLoggerModule } from './config/logger.module';
import { SentryModule } from './config/sentry.module';

import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // ─── Global config ────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env'],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

    // ─── Infrastructure ───────────────────────────────
    AppLoggerModule,
    SentryModule,
    DatabaseModule,
    RedisModule,
    QueueModule,

    // ─── Feature modules ──────────────────────────────
    AuthModule,
    UserModule,
    PostModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}

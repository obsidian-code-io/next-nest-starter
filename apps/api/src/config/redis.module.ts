import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');

        if (!redisUrl) {
          // Fall back to in-memory cache if REDIS_URL is not configured
          return {
            ttl: 60 * 1000,
            max: 1000,
          };
        }

        const { redisStore } = await import('cache-manager-ioredis-yet');

        return {
          store: redisStore,
          url: redisUrl,
          ttl: 60 * 1000,
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}

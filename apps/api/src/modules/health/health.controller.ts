import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Public()
  @Get()
  async check() {
    const checks: Record<string, { status: string; message?: string }> = {};

    // Redis connectivity check
    try {
      const testKey = '__health_check__';
      await this.cacheManager.set(testKey, 'ok', 5000);
      const result = await this.cacheManager.get(testKey);
      await this.cacheManager.del(testKey);
      checks.redis = {
        status: result === 'ok' ? 'up' : 'degraded',
      };
    } catch {
      checks.redis = {
        status: 'down',
        message: 'Redis unavailable — using in-memory cache fallback',
      };
    }

    const overallStatus = Object.values(checks).every(
      (c) => c.status === 'up',
    )
      ? 'ok'
      : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}

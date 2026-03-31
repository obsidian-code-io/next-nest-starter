import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @Optional() @InjectQueue('email') private readonly emailQueue?: Queue,
  ) {}

  async addEmailJob(
    type: string,
    data: Record<string, any>,
    opts?: { delay?: number; priority?: number },
  ): Promise<boolean> {
    if (!this.emailQueue) {
      this.logger.warn('Email queue not available — job will not be queued');
      return false;
    }

    try {
      await this.emailQueue.add(type, data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
        ...opts,
      });
      this.logger.debug(`Email job '${type}' added to queue`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to add email job '${type}': ${error}`);
      return false;
    }
  }
}

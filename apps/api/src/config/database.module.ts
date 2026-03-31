import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@monorepo/prisma';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: () => {
        const prisma = new PrismaClient();
        prisma.$connect();
        return prisma;
      },
    },
  ],
  exports: [PrismaClient],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(private readonly prisma: PrismaClient) {}

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}

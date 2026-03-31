import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@monorepo/prisma';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const createMockPrisma = (): MockPrismaClient => mockDeep<PrismaClient>();

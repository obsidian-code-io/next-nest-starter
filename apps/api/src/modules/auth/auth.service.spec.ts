import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@monorepo/prisma';
import { AuthService } from './auth.service';
import { createMockPrisma, MockPrismaClient } from '../../test/prisma-mock';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: MockPrismaClient;
  let jwtService: JwtService;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaClient, useValue: prisma },
        {
          provide: JwtService,
          useValue: { sign: vi.fn().mockReturnValue('mock-token'), verify: vi.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: vi.fn().mockReturnValue('test-secret') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' } as any);

      await expect(
        service.register({ email: 'test@test.com', name: 'Test', password: 'password' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        role: 'USER',
      } as any);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);

      const result = await service.register({
        email: 'test@test.com',
        name: 'Test',
        password: 'password',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for wrong credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
        role: 'USER',
        isActive: true,
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result.accessToken).toBe('mock-token');
    });
  });
});

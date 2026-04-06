import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(authorId: string, data: { title: string; content?: string }) {
    return this.prisma.post.create({
      data: { ...data, authorId },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(page = 1, pageSize = 20, publishedOnly = false) {
    const skip = (page - 1) * pageSize;
    const where = publishedOnly ? { published: true } : {};

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true } } },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    data: { title?: string; content?: string; published?: boolean },
  ) {
    const post = await this.findOne(id);

    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only edit your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data,
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const post = await this.findOne(id);

    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({ where: { id } });
    return { deleted: true };
  }
}

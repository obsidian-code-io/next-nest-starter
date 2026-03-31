import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Create demo admin user ──────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      // password: "password" — hashed with bcrypt (10 rounds)
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm',
      role: 'ADMIN',
    },
  });

  // ─── Create demo regular user ────────────────────
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Demo User',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm',
      role: 'USER',
    },
  });

  // ─── Create sample posts ─────────────────────────
  await prisma.post.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Getting Started with the Monorepo',
        content: 'This template includes a NestJS API, Next.js frontend, shared packages, and Prisma ORM — all wired up with Turborepo.',
        published: true,
        authorId: admin.id,
      },
      {
        title: 'Draft Post Example',
        content: 'This is an unpublished draft to demonstrate filtering.',
        published: false,
        authorId: user.id,
      },
    ],
  });

  console.log('✅ Seed complete');
  console.log(`   Admin: admin@example.com / password`);
  console.log(`   User:  user@example.com / password`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

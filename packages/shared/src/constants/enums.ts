/**
 * Shared enums used across API and Web apps.
 * Keep these in sync with your Prisma schema enums.
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

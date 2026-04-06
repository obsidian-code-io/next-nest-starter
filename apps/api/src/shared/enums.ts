/**
 * Shared enums used across the API.
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

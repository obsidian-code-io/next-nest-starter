import { UserRole } from '../constants/enums';

/** JWT token payload — decoded from access tokens */
export interface JwtPayload {
  sub: string;       // userId
  email: string;
  role: UserRole;
}

/** Standard paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/** Standard API error shape */
export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
  requestId?: string;
}

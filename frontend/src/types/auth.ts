export type UserRole = 'Customer' | 'Technician' | 'Admin' | 'SuperAdmin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  centerId: number | null;
  createdAt?: string;
  isDeleted?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}


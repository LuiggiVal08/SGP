export interface AuthUser {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  pnfId: string;
  institutionId: string;
  phone?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

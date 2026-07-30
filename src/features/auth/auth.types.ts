export type UserRole = 'Citizen' | 'Staff' | 'Admin'

export interface AuthUser {
  userId: string
  fullName: string
  email: string
  role: UserRole
  departmentId: number | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber?: string
}

export interface LoginResponse {
  userId: string
  fullName: string
  email: string
  role: UserRole
  departmentId: number | null
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

export interface RegisterResponse {
  userId: string
  fullName: string
  email: string
  role: UserRole
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

export interface CurrentUserResponse {
  userId: string
  fullName: string
  email: string
  phoneNumber: string | null
  role: UserRole
  departmentId: number | null
  departmentName: string | null
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

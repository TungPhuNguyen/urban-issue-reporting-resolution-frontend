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
  phoneNumber: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  userId: string
  fullName: string
  email: string
  role: UserRole
  departmentId: number | null
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
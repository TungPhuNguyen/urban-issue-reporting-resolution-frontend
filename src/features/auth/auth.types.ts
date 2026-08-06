export type UserRole = 'Citizen' | 'Staff' | 'Admin'

export interface AuthUser {
  userId: string
  fullName: string
  email: string
  role: UserRole
  departmentId: number | null
  departmentName?: string | null
  phoneNumber?: string | null
  isEmailVerified?: boolean
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
  isEmailVerified: boolean
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
  isEmailVerified: boolean
  requiresEmailVerification: boolean
  role: UserRole
  accessToken: string | null
  refreshToken: string | null
  refreshTokenExpiresAt: string | null
}

export interface CurrentUserResponse {
  userId: string
  fullName: string
  email: string
  isEmailVerified: boolean
  phoneNumber: string | null
  role: UserRole
  departmentId: number | null
  departmentName: string | null
}

export interface UpdateProfileRequest {
  fullName: string
  phoneNumber?: string | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  newPassword: string
  confirmNewPassword: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

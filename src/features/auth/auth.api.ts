import { http } from '@/lib/api/http'

import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
} from './auth.types'

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await http.post<LoginResponse>('/auth/login', payload)

    return response.data
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const response = await http.post<RegisterResponse>('/auth/register', payload)

    return response.data
  },

  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await http.get<CurrentUserResponse>('/auth/me')

    return response.data
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await http.post<RefreshTokenResponse>('/auth/refresh-token', {
      refreshToken,
    })

    return response.data
  },

  async logout(refreshToken: string): Promise<void> {
    await http.post('/auth/logout', {
      refreshToken,
    })
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<CurrentUserResponse> {
    const response = await http.put<CurrentUserResponse>('/auth/profile', payload)
    return response.data
  },

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await http.post('/auth/change-password', payload)
  },

  async resendVerificationEmail(email: string): Promise<void> {
    await http.post('/auth/resend-verification-email', { email })
  },

  async verifyEmail(email: string, token: string): Promise<void> {
    await http.post('/auth/verify-email', { email, token })
  },

  async forgotPassword(email: string): Promise<void> {
    await http.post('/auth/forgot-password', { email })
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await http.post('/auth/reset-password', payload)
  },
}

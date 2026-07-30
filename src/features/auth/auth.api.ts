import { http } from '@/lib/api/http'

import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
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
}

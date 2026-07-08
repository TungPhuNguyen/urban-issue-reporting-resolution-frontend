import type { LoginPayload, LoginResponse } from './auth.types'

/**
 * Auth API. This base ships a MOCK so the starter runs with no backend.
 * To use a real API, swap the body for:
 *
 *   import { http } from '@/lib/api/http'
 *   login: (p) => http.post<LoginResponse>('/auth/login', p).then((r) => r.data)
 */
export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    await new Promise((r) => setTimeout(r, 500))
    if (payload.password !== 'password') {
      const err = new Error('invalidCredentials')
      err.name = 'InvalidCredentials'
      throw err
    }
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: 1, name: 'Demo User', email: payload.email },
    }
  },
}

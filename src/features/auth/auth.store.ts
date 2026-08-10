import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { tokenStorage } from '@/lib/api/token-storage'

import { authApi } from './auth.api'
import type { AuthUser, LoginRequest } from './auth.types'

import { queryClient } from '@/app/query-client'

type AuthStatus = 'idle' | 'loading' | 'error'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isInitialized: boolean
  status: AuthStatus
  error: string | null

  login: (payload: LoginRequest, remember?: boolean) => Promise<AuthUser>
  updateUser: (user: AuthUser) => void
  loadCurrentUser: () => Promise<void>
  logout: () => Promise<void>
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      status: 'idle',
      error: null,

      login: async (payload, remember = false) => {
    set({
      status: 'loading',
      error: null,
    })

    try {
      const response = await authApi.login(payload)

      // Lưu token trước để /auth/me có Bearer token.
      tokenStorage.set(
        response.accessToken,
        response.refreshToken,
        remember,
      )

      // LoginResponse không có đầy đủ profile.
      // Gọi /auth/me để lấy phoneNumber, departmentName...
      const profile = await authApi.getCurrentUser()

      const user: AuthUser = {
        userId: profile.userId,
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role,
        departmentId: profile.departmentId,
        departmentName: profile.departmentName,
        phoneNumber: profile.phoneNumber,
        isEmailVerified: profile.isEmailVerified,
      }

      set({
        user,
        isAuthenticated: true,
        isInitialized: true,
        status: 'idle',
        error: null,
      })

      return user
    } catch (error) {
      tokenStorage.clear()

      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        status: 'error',
        error: 'Email hoặc mật khẩu không chính xác.',
      })

      throw error
    }
  },

  loadCurrentUser: async () => {
        const accessToken = tokenStorage.getAccess()
        const refreshToken = tokenStorage.getRefresh()

        // Không có cả hai token thì xem như chưa đăng nhập
        if (!accessToken && !refreshToken) {
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            status: 'idle',
            error: null,
          })

          return
        }

        set({
          status: 'loading',
          error: null,
        })

        try {
          // Gọi GET /api/v1/auth/me
          // Nếu access token hết hạn, Axios interceptor sẽ thử refresh token
          const response = await authApi.getCurrentUser()

          const user: AuthUser = {
            userId: response.userId,
            fullName: response.fullName,
            email: response.email,
            role: response.role,
            departmentId: response.departmentId,
            departmentName: response.departmentName,
            phoneNumber: response.phoneNumber,
            isEmailVerified: response.isEmailVerified,
          }

          set({
            user,
            isAuthenticated: true,
            isInitialized: true,
            status: 'idle',
            error: null,
          })
        } catch {
          // Token không hợp lệ hoặc refresh token cũng thất bại
          tokenStorage.clear()

          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            status: 'idle',
            error: null,
          })
        }
      },

      updateUser: (user) => set({ user }),

      logout: async () => {
        const refreshToken = tokenStorage.getRefresh()

        try {
          if (refreshToken) {
            await authApi.logout(refreshToken)
          }
        } finally {
          tokenStorage.clear()

          queryClient.removeQueries({
            queryKey: ['citizen-reports'],
          })

          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            status: 'idle',
            error: null,
          })
        }
      },

      clearAuth: () => {
        tokenStorage.clear()

        queryClient.removeQueries({
          queryKey: ['citizen-reports'],
        })

        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          status: 'idle',
          error: null,
        })
      },
    }),
    {
      name: 'urban-issue-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().clearAuth()
  })
}

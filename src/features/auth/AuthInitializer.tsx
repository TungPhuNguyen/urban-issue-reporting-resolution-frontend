import { useEffect, type ReactNode } from 'react'

import { Spinner } from '@/components/ui/Spinner'
import { useNotificationRealtime } from '@/features/notifications/useNotificationRealtime'

import { useAuthStore } from './auth.store'

interface AuthInitializerProps {
  children: ReactNode
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser)

  const isInitialized = useAuthStore((state) => state.isInitialized)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useNotificationRealtime(isAuthenticated)

  useEffect(() => {
    if (!isInitialized) {
      void loadCurrentUser()
    }
  }, [isInitialized, loadCurrentUser])

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Đang kiểm tra phiên đăng nhập..." />
      </div>
    )
  }

  return children
}

import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { Spinner } from '@/components/ui/Spinner'
import { tokenStorage } from '@/lib/api/token-storage'

import { useAuthStore } from './auth.store'

export default function ProtectedRoute() {
  const location = useLocation()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const isInitialized = useAuthStore((state) => state.isInitialized)

  const accessToken = tokenStorage.getAccess()

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Đang kiểm tra đăng nhập..." />
      </div>
    )
  }

  if (!isAuthenticated || !accessToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    )
  }

  return <Outlet />
}

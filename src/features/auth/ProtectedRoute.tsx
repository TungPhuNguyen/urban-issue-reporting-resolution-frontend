import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { tokenStorage } from '@/lib/api/token-storage'

import { useAuthStore } from './auth.store'

export default function ProtectedRoute() {
  const location = useLocation()

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  )

  const accessToken = tokenStorage.getAccess()

  if (!isAuthenticated || !accessToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    )
  }

  return <Outlet />
}
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from './auth.store'

/**
 * Route guard. Wrap protected routes with this element; unauthenticated users
 * are redirected to /login and returned to their target after signing in.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

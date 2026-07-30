import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from './auth.store'
import type { UserRole } from './auth.types'

interface RoleRouteProps {
  allowedRoles: UserRole[]
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}

import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import AdminLayout from '@/components/layout/AdminLayout'
import CitizenLayout from '@/components/layout/CitizenLayout'
import PublicLayout from '@/components/layout/PublicLayout'
import StaffLayout from '@/components/layout/StaffLayout'

import ProtectedRoute from '@/features/auth/ProtectedRoute'
import RoleRoute from '@/features/auth/RoleRoute'

import AdminDashboardPage from '@/features/admin/DashboardPage'
import CitizenReportsPage from '@/features/citizen/ReportsPage'
import StaffReportsPage from '@/features/staff/ReportsPage'

import ForbiddenPage from '@/pages/ForbiddenPage'

import { NotFoundPage } from '@/pages/NotFoundPage'

import ReportDetailPage from '@/features/citizen/ReportDetailPage'

// Public pages
const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({
    default: module.HomePage,
  })),
)

const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
)

// RegisterPage đang export default
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))

export const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: '403',
        element: <ForbiddenPage />,
      },
    ],
  },

  // Các route bên dưới bắt buộc phải đăng nhập
  {
    element: <ProtectedRoute />,
    children: [
      // Citizen routes
      {
        element: <RoleRoute allowedRoles={['Citizen']} />,
        children: [
          {
            path: 'citizen',
            element: <CitizenLayout />,
            children: [
              {
                path: 'reports',
                element: <CitizenReportsPage />,
              },
              {
                path: 'reports/:reportId',
                element: <ReportDetailPage />,
              },
            ],
          },
        ],
      },

      // Staff routes
      {
        element: <RoleRoute allowedRoles={['Staff']} />,
        children: [
          {
            path: 'staff',
            element: <StaffLayout />,
            children: [
              {
                path: 'reports',
                element: <StaffReportsPage />,
              },
            ],
          },
        ],
      },

      // Admin routes
      {
        element: <RoleRoute allowedRoles={['Admin']} />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              {
                path: 'dashboard',
                element: <AdminDashboardPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  // Route không tồn tại
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

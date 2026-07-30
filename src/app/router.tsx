import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import AdminLayout from '@/components/layout/AdminLayout'
import CitizenLayout from '@/components/layout/CitizenLayout'
import PublicLayout from '@/components/layout/PublicLayout'
import StaffLayout from '@/components/layout/StaffLayout'

import ProtectedRoute from '@/features/auth/ProtectedRoute'
import RoleRoute from '@/features/auth/RoleRoute'

import ForbiddenPage from '@/pages/ForbiddenPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

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

const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))

const AdminDashboardPage = lazy(
  () => import('@/features/admin/DashboardPage'),
)

const CitizenReportsPage = lazy(
  () => import('@/features/citizen/ReportsPage'),
)

const CreateReportPage = lazy(
  () => import('@/features/citizen/reports/CreateReportPage'),
)

const ReportDetailPage = lazy(
  () => import('@/features/citizen/reports/ReportDetailPage'),
)

const StaffReportsPage = lazy(
  () => import('@/features/staff/ReportsPage'),
)

const StaffReportDetailPage = lazy(
  () => import('@/features/staff/ReportDetailPage'),
)

export const router = createBrowserRouter([
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

  {
    element: <ProtectedRoute />,
    children: [
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
                path: 'reports/create',
                element: <CreateReportPage />,
              },
              {
                path: 'reports/:reportId',
                element: <ReportDetailPage />,
              },
            ],
          },
        ],
      },

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
              {
                path: 'reports/:reportId',
                element: <StaffReportDetailPage />,
              },
            ],
          },
        ],
      },

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

  {
    path: '*',
    element: <NotFoundPage />,
  },
])

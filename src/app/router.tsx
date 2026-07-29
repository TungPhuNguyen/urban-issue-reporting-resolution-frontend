import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import AdminLayout from '@/components/layout/AdminLayout'
import CitizenLayout from '@/components/layout/CitizenLayout'
import PublicLayout from '@/components/layout/PublicLayout'
import StaffLayout from '@/components/layout/StaffLayout'

import AdminDashboardPage from '@/features/admin/DashboardPage'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import RoleRoute from '@/features/auth/RoleRoute'
import CitizenReportsPage from '@/features/citizen/ReportsPage'
import CreateReportPage from '@/features/citizen/reports/CreateReportPage'
import ReportDetailPage from '@/features/citizen/reports/ReportDetailPage'
import StaffReportsPage from '@/features/staff/ReportsPage'
import StaffReportDetailPage from '@/features/staff/ReportDetailPage'

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

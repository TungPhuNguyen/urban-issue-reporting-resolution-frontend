import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import AdminLayout from '@/components/layout/AdminLayout'
import CitizenLayout from '@/components/layout/CitizenLayout'
import PublicLayout from '@/components/layout/PublicLayout'
import StaffLayout from '@/components/layout/StaffLayout'

import AdminDashboardPage from '@/features/admin/DashboardPage'
import AdminReportDetailPage from '@/features/admin/reports/AdminReportDetailPage'
import ManualAssignmentQueuePage from '@/features/admin/reports/ManualAssignmentQueuePage'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import RoleRoute from '@/features/auth/RoleRoute'
import CitizenReportsPage from '@/features/citizen/ReportsPage'
import CreateReportPage from '@/features/citizen/reports/CreateReportPage'
import ReportDetailPage from '@/features/citizen/reports/ReportDetailPage'
import StaffReportsPage from '@/features/staff/ReportsPage'
import StaffReportDetailPage from '@/features/staff/reports/StaffReportDetailPage'
import RoutingRulesPage from '@/features/admin/routing-rules/RoutingRulesPage'
import SlaConfigsPage from '@/features/admin/sla-configs/SlaConfigsPage'
import CategoriesPage from '@/features/admin/categories/CategoriesPage'
import AreasPage from '@/features/admin/areas/AreasPage'
import DepartmentsPage from '@/features/admin/departments/DepartmentsPage'
import NotificationsPage from '@/features/notifications/NotificationsPage'

import OverdueReportsPage from '@/features/overdue-reports/OverdueReportsPage'



import ForbiddenPage from '@/pages/ForbiddenPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({
    default: module.HomePage,
  })),
)

const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then(
    (module) => ({
      default: module.LoginPage,
    }),
  ),
)

const RegisterPage = lazy(
  () => import('@/features/auth/RegisterPage'),
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
        element: (
          <RoleRoute
            allowedRoles={['Citizen']}
          />
        ),

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
              {
                path: 'notifications',
                element: <NotificationsPage />,
              },
            ],
          },
        ],
      },

      {
        element: (
          <RoleRoute
            allowedRoles={['Staff']}
          />
        ),

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
              {
                path: 'notifications',
                element: <NotificationsPage />,
              },
              {
                path: 'overdue-reports',
                element: <OverdueReportsPage />,
              },
            ],
          },
        ],
      },

      {
        element: (
          <RoleRoute
            allowedRoles={['Admin']}
          />
        ),

        children: [
          {
            path: 'admin',
            element: <AdminLayout />,

            children: [
              {
                path: 'dashboard',
                element: <AdminDashboardPage />,
              },

              {
                path:
                  'reports/manual-assignment',

                element:
                  <ManualAssignmentQueuePage />,
              },

              {
                path: 'reports/:reportId',

                element:
                  <AdminReportDetailPage />,
              },
              {
                path: 'routing-rules',
                element: <RoutingRulesPage />,
              },
              {
                path: 'sla-configs',
                element: <SlaConfigsPage />,
              },
              {
                path: 'categories',
                element: <CategoriesPage />,
              },

              {
                path: 'areas',
                element: <AreasPage />,
              },
              {
                path: 'departments',
                element: <DepartmentsPage />,
              },

              {
                path: 'notifications',
                element: <NotificationsPage />,
              },
              {
                path: 'overdue-reports',
                element: <OverdueReportsPage />,
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

import { createBrowserRouter } from 'react-router-dom'

import AdminLayout from '@/components/layout/AdminLayout'
import CitizenLayout from '@/components/layout/CitizenLayout'
import PublicLayout from '@/components/layout/PublicLayout'
import StaffLayout from '@/components/layout/StaffLayout'

import AdminReportDetailPage from '@/features/admin/reports/AdminReportDetailPage'
import AdminReportsPage from '@/features/admin/reports/AdminReportsPage'
import ManualAssignmentQueuePage from '@/features/admin/reports/ManualAssignmentQueuePage'
import AuditLogsPage from '@/features/admin/audit-logs/AuditLogsPage'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import RoleRoute from '@/features/auth/RoleRoute'

import RoutingRulesPage from '@/features/admin/routing-rules/RoutingRulesPage'
import SlaConfigsPage from '@/features/admin/sla-configs/SlaConfigsPage'
import CategoriesPage from '@/features/admin/categories/CategoriesPage'
import AreasPage from '@/features/admin/areas/AreasPage'
import DepartmentsPage from '@/features/admin/departments/DepartmentsPage'
import NotificationsPage from '@/features/notifications/NotificationsPage'
import AccountPage from '@/features/auth/AccountPage'
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/features/auth/ResetPasswordPage'
import VerifyEmailPage from '@/features/auth/VerifyEmailPage'
import EditReportPage from '@/features/citizen/reports/EditReportPage'
import ReportLookupPage from '@/features/citizen/reports/ReportLookupPage'
import PublicReportsPage from '@/features/public-reports/PublicReportsPage'
import PublicReportDetailPage from '@/features/public-reports/PublicReportDetailPage'
import PublicReportLookupPage from '@/features/public-reports/PublicReportLookupPage'
import StaffDashboardPage from '@/features/staff/DashboardPage'
import UsersListPage from '@/features/users/UsersListPage'

import OverdueReportsPage from '@/features/overdue-reports/OverdueReportsPage'

import ForbiddenPage from '@/pages/ForbiddenPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

import {
  AdminDashboardPage,
  CitizenDashboardPage,
  CitizenReportsPage,
  CreateReportPage,
  HomePage,
  LoginPage,
  RegisterPage,
  ReportDetailPage,
  StaffReportDetailPage,
  StaffReportsPage,
} from './lazy-pages'

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

      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: 'reports', element: <PublicReportsPage /> },
      { path: 'reports/:reportId', element: <PublicReportDetailPage /> },
      { path: 'lookup', element: <PublicReportLookupPage /> },

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
                path: 'dashboard',
                element: <CitizenDashboardPage />,
              },
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
              { path: 'reports/:reportId/edit', element: <EditReportPage /> },
              { path: 'reports/lookup', element: <ReportLookupPage /> },
              {
                path: 'notifications',
                element: <NotificationsPage />,
              },
              { path: 'account', element: <AccountPage /> },
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
              { path: 'dashboard', element: <StaffDashboardPage /> },
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
              { path: 'account', element: <AccountPage /> },
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

              {
                path: 'reports',
                element: <AdminReportsPage />,
              },

              {
                path: 'reports/manual-assignment',

                element: <ManualAssignmentQueuePage />,
              },

              {
                path: 'reports/:reportId',

                element: <AdminReportDetailPage />,
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
                path: 'audit-logs',
                element: <AuditLogsPage />,
              },

              {
                path: 'notifications',
                element: <NotificationsPage />,
              },
              {
                path: 'overdue-reports',
                element: <OverdueReportsPage />,
              },
              { path: 'users', element: <UsersListPage /> },
              { path: 'account', element: <AccountPage /> },
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

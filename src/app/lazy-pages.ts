import { lazy } from 'react'

export const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({
    default: module.HomePage,
  })),
)

export const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
)

export const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))

export const AdminDashboardPage = lazy(() => import('@/features/admin/DashboardPage'))

export const CitizenReportsPage = lazy(() => import('@/features/citizen/ReportsPage'))

export const CreateReportPage = lazy(
  () => import('@/features/citizen/reports/CreateReportPage'),
)

export const ReportDetailPage = lazy(
  () => import('@/features/citizen/reports/ReportDetailPage'),
)

export const StaffReportsPage = lazy(() => import('@/features/staff/ReportsPage'))

export const StaffReportDetailPage = lazy(
  () => import('@/features/staff/ReportDetailPage'),
)

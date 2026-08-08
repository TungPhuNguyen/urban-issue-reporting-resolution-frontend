import type { PagedResult } from '@/features/reports/report.types'

export interface AdminUserSummary {
  id: string
  fullName: string
  email: string
  roleName: 'Citizen' | 'Staff' | 'Admin' | string
  departmentId: number | null
  departmentName: string | null
  isActive: boolean
  activeAssignedReportCount: number
  overdueReportCount: number
  createdAt: string
  updatedAt: string | null
}

export interface AdminUserDetail extends AdminUserSummary {
  createdReportCount: number
  assignedReportCount: number
}

export interface AdminUserListParams {
  search?: string
  roleName?: string
  departmentId?: number
  isActive?: boolean
  pageNumber: number
  pageSize: number
}

export interface ChangeUserStatusInput {
  id: string
  isActive: boolean
  reason: string
}

export interface StaffInput {
  id?: string
  fullName: string
  email: string
  password?: string
  departmentId: number
}

export type AdminUsersResponse = PagedResult<AdminUserSummary>

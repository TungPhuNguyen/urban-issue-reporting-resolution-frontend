import { http } from '@/lib/api/http'
import type {
  AdminUserDetail,
  AdminUserListParams,
  AdminUsersResponse,
  ChangeUserStatusInput,
  StaffInput,
} from './users.types'

export const usersApi = {
  async list(params: AdminUserListParams): Promise<AdminUsersResponse> {
    const response = await http.get<AdminUsersResponse>('/admin/users', { params })
    return response.data
  },
  async get(id: string): Promise<AdminUserDetail> {
    const response = await http.get<AdminUserDetail>(`/admin/users/${id}`)
    return response.data
  },
  async changeStatus(input: ChangeUserStatusInput): Promise<void> {
    await http.patch(`/admin/users/${input.id}/status`, {
      isActive: input.isActive,
      reason: input.reason.trim(),
    })
  },
  async saveStaff(input: StaffInput): Promise<void> {
    if (input.id) {
      await http.put(`/admin/staff/${input.id}`, {
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        departmentId: input.departmentId,
      })
      return
    }
    await http.post('/admin/staff', {
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      password: input.password,
      departmentId: input.departmentId,
    })
  },
}

import { http } from '@/lib/api/http'

import type {
  AuditLogDetail,
  AuditLogParams,
  AuditLogSummary,
  PagedResult,
} from './audit-logs.types'

export const auditLogsApi = {
  async getAll(params: AuditLogParams): Promise<PagedResult<AuditLogSummary>> {
    const response = await http.get<PagedResult<AuditLogSummary>>('/admin/audit-logs', {
      params: {
        ...params,
        action: params.action?.trim() || undefined,
        entityType: params.entityType?.trim() || undefined,
        entityId: params.entityId?.trim() || undefined,
      },
    })

    return response.data
  },

  async getById(id: number) {
    const response = await http.get<AuditLogDetail>(`/admin/audit-logs/${id}`)

    return response.data
  },
}

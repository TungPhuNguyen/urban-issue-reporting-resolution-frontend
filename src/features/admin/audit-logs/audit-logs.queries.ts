import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { auditLogsApi } from './audit-logs.api'
import type { AuditLogParams } from './audit-logs.types'

export const auditLogKeys = {
  all: ['admin', 'audit-logs'] as const,
  list: (params: AuditLogParams) => [...auditLogKeys.all, 'list', params] as const,
  detail: (id: number) => [...auditLogKeys.all, 'detail', id] as const,
}

export function useAuditLogs(params: AuditLogParams) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => auditLogsApi.getAll(params),
    placeholderData: keepPreviousData,
  })
}

export function useAuditLogDetail(id: number | null) {
  return useQuery({
    queryKey: auditLogKeys.detail(id ?? 0),
    queryFn: () => auditLogsApi.getById(id!),
    enabled: id !== null,
  })
}

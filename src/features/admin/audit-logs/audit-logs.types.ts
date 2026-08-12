export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface AuditLogSummary {
  id: number
  userId: string | null
  userName: string | null
  userEmail: string | null
  action: string
  entityType: string
  entityId: string
  createdAt: string
}

export interface AuditLogDetail extends AuditLogSummary {
  detail: string
}

export interface AuditLogParams {
  action?: string
  entityType?: string
  entityId?: string
  createdFrom?: string
  createdTo?: string
  pageNumber: number
  pageSize: number
}

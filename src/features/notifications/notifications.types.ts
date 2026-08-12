export type NotificationType =
  | 'ReportAssigned'
  | 'ReportStatusChanged'
  | 'ReportResolved'
  | 'ReportClosed'
  | 'ReportRejected'
  | 'ReportReopened'
  | 'ReportReassigned'
  | 'ComplaintSubmitted'
  | 'SLAWarning'
  | 'SLABreached'
  | 'Escalated'
  | 'ReportReclassified'
  | 'ReportCancelled'

export interface NotificationItem {
  id: number
  reportId: string | null
  reportCode: string | null
  actionUrl: string | null
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  readAt: string | null
}

export interface NotificationListParams {
  isRead?: boolean
  pageNumber: number
  pageSize: number
}

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface MarkAllReadResult {
  updatedCount: number
}

export interface UnreadNotificationCountResult {
  unreadCount: number
}

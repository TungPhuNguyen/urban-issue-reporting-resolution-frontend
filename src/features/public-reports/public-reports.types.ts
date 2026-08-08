import type {
  PagedResult,
  ReportAllowedActions,
  ReportPriority,
  ReportStatus,
} from '@/features/reports/report.types'

export type PublicReportSort = 'Newest' | 'MostUpvoted' | 'Nearby'

export interface PublicReportsParams {
  search?: string
  categoryId?: number
  areaId?: number
  status?: ReportStatus
  priority?: ReportPriority
  sortBy?: PublicReportSort
  currentLatitude?: number
  currentLongitude?: number
  createdFrom?: string
  createdTo?: string
  minLatitude?: number
  maxLatitude?: number
  minLongitude?: number
  maxLongitude?: number
  pageNumber?: number
  pageSize?: number
}

export interface PublicReportItem {
  id: string
  reportCode: string
  title: string
  categoryId: number
  categoryName: string
  areaId: number
  areaName: string
  departmentId: number | null
  departmentName: string | null
  description: string
  addressText: string | null
  latitude: number
  longitude: number
  priority: ReportPriority | null
  status: ReportStatus
  upvoteCount: number
  isUpvotedByCurrentUser: boolean
  commentCount: number
  thumbnailUrl: string | null
  createdAt: string
  resolvedAt: string | null
  closedAt: string | null
  allowedActions: ReportAllowedActions
}

export interface PublicReportDetail extends Omit<PublicReportItem, 'thumbnailUrl'> {
  imageUrls: string[]
  updatedAt: string | null
  acceptedAt: string | null
}

export type PublicReportsResponse = PagedResult<PublicReportItem>

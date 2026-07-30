export interface StaffReportDetail {
  id: string
  citizenId: string
  citizenName: string
  categoryId: number
  categoryName: string
  areaId: number
  areaName: string
  departmentId: number | null
  departmentName: string | null
  assignedStaffId: string | null
  assignedStaffName: string | null
  description: string
  addressText: string | null
  latitude: number
  longitude: number
  priority: string | null
  status: string
  upvoteCount: number
  imageUrls: string[]
  appliedSlaHours: number | null
  slaStartedAt: string | null
  dueAt: string | null
  isEscalated: boolean
  escalatedAt: string | null
  hasSubmittedComplaint: boolean
  complaintSubmittedAt: string | null
  complaintReason: string | null
  createdAt: string
  updatedAt: string | null
  acceptedAt: string | null
  resolvedAt: string | null
}

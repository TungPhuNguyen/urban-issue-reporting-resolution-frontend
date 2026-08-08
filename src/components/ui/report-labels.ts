const statusLabels: Record<string, string> = {
  New: 'Mới tiếp nhận',
  Assigned: 'Đã phân công',
  Accepted: 'Đã tiếp nhận',
  InProgress: 'Đang xử lý',
  Resolved: 'Đã xử lý',
  Reopened: 'Đã mở lại',
  Closed: 'Đã đóng',
  Rejected: 'Từ chối',
  Cancelled: 'Đã hủy',
}

const priorityLabels: Record<string, string> = {
  Low: 'Ưu tiên thấp',
  Medium: 'Ưu tiên vừa',
  High: 'Ưu tiên cao',
}

export function getStatusLabel(status?: string | null) {
  return status ? (statusLabels[status] ?? status) : 'Không xác định'
}

export function getPriorityLabel(priority?: string | null) {
  return priority ? (priorityLabels[priority] ?? priority) : 'Chưa xác định'
}

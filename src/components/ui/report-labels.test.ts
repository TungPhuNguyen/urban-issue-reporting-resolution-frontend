import { describe, expect, it } from 'vitest'

import { getPriorityLabel, getStatusLabel } from './report-labels'

describe('report labels', () => {
  it('hiển thị đầy đủ nhãn trạng thái tiếng Việt', () => {
    expect(getStatusLabel('New')).toBe('Mới tiếp nhận')
    expect(getStatusLabel('Assigned')).toBe('Đã phân công')
    expect(getStatusLabel('Accepted')).toBe('Đã tiếp nhận')
    expect(getStatusLabel('InProgress')).toBe('Đang xử lý')
    expect(getStatusLabel('Resolved')).toBe('Đã xử lý')
    expect(getStatusLabel('Reopened')).toBe('Đã mở lại')
    expect(getStatusLabel('Closed')).toBe('Đã đóng')
    expect(getStatusLabel('Rejected')).toBe('Từ chối')
  })

  it('hiển thị nhãn mức ưu tiên tiếng Việt', () => {
    expect(getPriorityLabel('Low')).toBe('Ưu tiên thấp')
    expect(getPriorityLabel('Medium')).toBe('Ưu tiên vừa')
    expect(getPriorityLabel('High')).toBe('Ưu tiên cao')
  })

  it('giữ lại giá trị chưa biết và xử lý giá trị rỗng', () => {
    expect(getStatusLabel('CustomStatus')).toBe('CustomStatus')
    expect(getStatusLabel(undefined)).toBe('Không xác định')
    expect(getPriorityLabel('CustomPriority')).toBe('CustomPriority')
    expect(getPriorityLabel(null)).toBe('Chưa xác định')
  })
})

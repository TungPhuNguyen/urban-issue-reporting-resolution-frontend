import { describe, expect, it } from 'vitest'

import { localizeCitizenFacingText } from './citizen-facing-text'

describe('localizeCitizenFacingText', () => {
  it.each([
    ['Báo cáo đã quá hạn SLA.', 'Báo cáo đã quá thời hạn xử lý.'],
    [
      'Báo cáo sắp hết hạn SLA lúc 10/08/2026 08:00 UTC.',
      'Báo cáo sắp hết thời hạn xử lý lúc 10/08/2026 08:00 UTC.',
    ],
    [
      'Hệ thống Escalate báo cáo sau khi vượt 150% thời gian SLA.',
      'Hệ thống chuyển cấp báo cáo sau khi vượt 150% thời hạn xử lý.',
    ],
  ])('localizes Citizen-visible processing terms', (source, expected) => {
    expect(localizeCitizenFacingText(source)).toBe(expected)
  })
})

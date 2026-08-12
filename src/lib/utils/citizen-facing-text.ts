const citizenFacingReplacements: ReadonlyArray<readonly [RegExp, string]> = [
  [/báo cáo SLA bị Escalated/gi, 'báo cáo đã được chuyển cấp'],
  [/Hệ thống Escalate báo cáo/gi, 'Hệ thống chuyển cấp báo cáo'],
  [/150% thời gian SLA/gi, '150% thời hạn xử lý'],
  [/quá hạn SLA/gi, 'quá thời hạn xử lý'],
  [/hết hạn SLA/gi, 'hết thời hạn xử lý'],
  [/thời gian SLA/gi, 'thời hạn xử lý'],
  [/mốc SLA/gi, 'mốc thời hạn xử lý'],
  [/\bSLA\b/gi, 'thời hạn xử lý'],
]

export function localizeCitizenFacingText(value: string): string {
  return citizenFacingReplacements.reduce(
    (localizedValue, [pattern, replacement]) =>
      localizedValue.replace(pattern, replacement),
    value,
  )
}

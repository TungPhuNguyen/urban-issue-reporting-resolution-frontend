const TIME_ZONE_SUFFIX_PATTERN = /(?:z|[+-]\d{2}:?\d{2})$/i

/**
 * SQL Server datetime2 values can reach the API without a timezone suffix.
 * The backend stores report timestamps in UTC, so treat suffix-less values as UTC.
 */
export function parseApiDateTime(value: string): Date {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return new Date(Number.NaN)
  }

  return new Date(
    TIME_ZONE_SUFFIX_PATTERN.test(normalizedValue)
      ? normalizedValue
      : `${normalizedValue}Z`,
  )
}

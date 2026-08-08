import { describe, expect, it } from 'vitest'

import { parseApiDateTime } from './date-time'

describe('parseApiDateTime', () => {
  it('treats a timezone-less API timestamp as UTC', () => {
    expect(parseApiDateTime('2026-08-06T06:22:36').toISOString()).toBe(
      '2026-08-06T06:22:36.000Z',
    )
  })

  it('preserves timestamps that already contain a timezone', () => {
    expect(parseApiDateTime('2026-08-06T06:22:36Z').toISOString()).toBe(
      '2026-08-06T06:22:36.000Z',
    )
    expect(parseApiDateTime('2026-08-06T13:22:36+07:00').toISOString()).toBe(
      '2026-08-06T06:22:36.000Z',
    )
  })

  it('returns an invalid date for an invalid or empty value', () => {
    expect(parseApiDateTime('invalid').getTime()).toBeNaN()
    expect(parseApiDateTime('   ').getTime()).toBeNaN()
  })
})

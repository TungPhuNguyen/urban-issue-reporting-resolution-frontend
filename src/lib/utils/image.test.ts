import { describe, expect, it } from 'vitest'

import { resolveImageUrl } from './image'

describe('resolveImageUrl', () => {
  it('resolves an upload URL against the API origin in production', () => {
    expect(
      resolveImageUrl(
        '/uploads/reports/report.jpg',
        '/api',
        'https://urban-issue.example',
      ),
    ).toBe('https://urban-issue.example/uploads/reports/report.jpg')
  })

  it('normalizes a relative image path', () => {
    expect(
      resolveImageUrl(
        'uploads/reports/report.jpg',
        'https://api.urban-issue.example/api/v1',
        'https://urban-issue.example',
      ),
    ).toBe('https://api.urban-issue.example/uploads/reports/report.jpg')
  })

  it('keeps an absolute image URL unchanged', () => {
    expect(
      resolveImageUrl(
        'https://cdn.example/report.jpg',
        '/api',
        'https://urban-issue.example',
      ),
    ).toBe('https://cdn.example/report.jpg')
  })
})

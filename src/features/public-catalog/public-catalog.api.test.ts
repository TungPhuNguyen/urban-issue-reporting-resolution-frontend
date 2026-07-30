import { beforeEach, describe, expect, it, vi } from 'vitest'

import { http } from '@/lib/api/http'

import { publicCatalogApi } from './public-catalog.api'

vi.mock('@/lib/api/http', () => ({
  http: {
    get: vi.fn(),
  },
}))

const areas = [
  {
    id: 1,
    name: 'Quận 1',
    code: 'Q1',
    parentAreaId: null,
  },
  {
    id: 2,
    name: 'Quận 2',
    code: 'Q2',
    parentAreaId: null,
  },
  {
    id: 11,
    name: 'Phường Bến Nghé',
    code: 'BN',
    parentAreaId: 1,
  },
]

describe('publicCatalogApi.getAreas', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
    vi.mocked(http.get).mockResolvedValue({
      data: areas,
    })
  })

  it('returns only root areas for the district selector', async () => {
    const result = await publicCatalogApi.getAreas(null)

    expect(http.get).toHaveBeenCalledWith('/public/areas', {
      params: undefined,
    })
    expect(result).toEqual(areas.slice(0, 2))
  })

  it('requests and returns only children of the selected district', async () => {
    const result = await publicCatalogApi.getAreas(1)

    expect(http.get).toHaveBeenCalledWith('/public/areas', {
      params: {
        parentAreaId: 1,
      },
    })
    expect(result).toEqual([areas[2]])
  })
})

import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LocationPicker } from './LocationPicker'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  Marker: () => null,
  TileLayer: () => null,
  useMap: () => ({
    getZoom: () => 14,
    setView: vi.fn(),
  }),
  useMapEvents: () => null,
}))

function setGeolocation(value: Geolocation | undefined) {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value,
  })
}

afterEach(() => {
  setGeolocation(undefined)
})

describe('LocationPicker', () => {
  it('uses the current browser position and updates the selected coordinates', async () => {
    const onChange = vi.fn()
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>((success) => {
      success({
        coords: {
          latitude: 21.028511,
          longitude: 105.804817,
        },
      } as GeolocationPosition)
    })

    setGeolocation({ getCurrentPosition } as unknown as Geolocation)

    render(<LocationPicker value={null} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Sử dụng vị trí hiện tại' }))

    expect(getCurrentPosition).toHaveBeenCalledOnce()
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0,
      },
    )
    expect(onChange).toHaveBeenCalledWith({
      latitude: 21.028511,
      longitude: 105.804817,
    })
    expect(screen.getByText('Đã chọn: 21.028511, 105.804817')).toBeInTheDocument()
  })

  it('shows a clear message when location permission is denied', async () => {
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>(
      (_success, error) => {
        error?.({ code: 1 } as GeolocationPositionError)
      },
    )

    setGeolocation({ getCurrentPosition } as unknown as Geolocation)

    render(<LocationPicker value={null} onChange={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Sử dụng vị trí hiện tại' }))

    expect(
      await screen.findByText(
        'Bạn đã từ chối quyền truy cập vị trí. Hãy cấp quyền trong cài đặt trình duyệt rồi thử lại.',
      ),
    ).toBeInTheDocument()
  })

  it('shows a fallback message when geolocation is unavailable', async () => {
    setGeolocation(undefined)

    render(<LocationPicker value={null} onChange={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Sử dụng vị trí hiện tại' }))

    await waitFor(() => {
      expect(
        screen.getByText(
          'Trình duyệt không hỗ trợ định vị. Vui lòng chọn vị trí trực tiếp trên bản đồ.',
        ),
      ).toBeInTheDocument()
    })
  })
})

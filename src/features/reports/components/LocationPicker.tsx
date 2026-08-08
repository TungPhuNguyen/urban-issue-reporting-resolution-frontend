import { LocateFixed, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

import type { LatLng } from '../report-form.types'

import 'leaflet/dist/leaflet.css'

interface LocationPickerProps {
  value: LatLng | null
  onChange: (location: LatLng) => void
  disabled?: boolean
  error?: string
  className?: string
}

interface MapClickHandlerProps {
  disabled: boolean
  onPick: (latitude: number, longitude: number) => void
}

interface MapViewControllerProps {
  position: [number, number] | null
}

const DEFAULT_CENTER: [number, number] = [21.0285, 105.8542]

function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case 1:
      return 'Bạn đã từ chối quyền truy cập vị trí. Hãy cấp quyền trong cài đặt trình duyệt rồi thử lại.'
    case 2:
      return 'Không thể xác định vị trí hiện tại. Hãy kiểm tra GPS hoặc kết nối mạng.'
    case 3:
      return 'Quá thời gian xác định vị trí. Vui lòng thử lại.'
    default:
      return 'Không thể lấy vị trí hiện tại. Vui lòng thử lại.'
  }
}

function MapClickHandler({ disabled, onPick }: MapClickHandlerProps) {
  useMapEvents({
    click(event) {
      if (disabled) {
        return
      }

      onPick(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

/**
 * MapContainer only uses its center value when the map is initialized.
 * This component moves the map when the selected value changes.
 */
function MapViewController({ position }: MapViewControllerProps) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom())
    }
  }, [map, position])

  return null
}

export function LocationPicker({
  value,
  onChange,
  disabled = false,
  error,
  className,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    value ? [value.latitude, value.longitude] : null,
  )
  const [isLocating, setIsLocating] = useState(false)
  const [geolocationError, setGeolocationError] = useState('')

  /*
   * Synchronize the marker with the parent form.
   * For example, when the form is reset, value becomes null
   * and the marker must disappear.
   */
  useEffect(() => {
    setPosition(value ? [value.latitude, value.longitude] : null)
  }, [value])

  const handlePick = (latitude: number, longitude: number) => {
    if (disabled) {
      return
    }

    const selectedPosition: [number, number] = [latitude, longitude]

    setPosition(selectedPosition)

    onChange({
      latitude,
      longitude,
    })
  }

  const handleUseCurrentLocation = () => {
    if (disabled || isLocating) {
      return
    }

    if (!navigator.geolocation) {
      setGeolocationError(
        'Trình duyệt không hỗ trợ định vị. Vui lòng chọn vị trí trực tiếp trên bản đồ.',
      )
      return
    }

    setIsLocating(true)
    setGeolocationError('')

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        handlePick(coords.latitude, coords.longitude)
        setIsLocating(false)
      },
      (geolocationPositionError) => {
        setGeolocationError(getGeolocationErrorMessage(geolocationPositionError))
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0,
      },
    )
  }

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className="block text-sm font-medium">
          Vị trí xảy ra sự cố
          <span className="ml-1 text-red-500">*</span>
        </label>

        <button
          type="button"
          disabled={disabled || isLocating}
          aria-busy={isLocating}
          onClick={handleUseCurrentLocation}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLocating ? (
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed aria-hidden="true" className="h-4 w-4" />
          )}
          {isLocating ? 'Đang xác định vị trí...' : 'Sử dụng vị trí hiện tại'}
        </button>
      </div>

      {geolocationError && (
        <p role="alert" className="mb-2 text-sm text-red-600">
          {geolocationError}
        </p>
      )}

      <div
        className={[
          'overflow-hidden rounded-md border',
          error ? 'border-red-500' : 'border-gray-300',
          disabled ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
        aria-invalid={Boolean(error)}
      >
        <MapContainer
          center={position ?? DEFAULT_CENTER}
          zoom={14}
          style={{
            height: '320px',
            width: '100%',
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <MapClickHandler disabled={disabled} onPick={handlePick} />

          <MapViewController position={position} />

          {position && (
            <Marker
              position={position}
              draggable={!disabled}
              eventHandlers={{
                dragend: (event) => {
                  if (disabled) {
                    return
                  }

                  const marker = event.target
                  const newPosition = marker.getLatLng()

                  handlePick(newPosition.lat, newPosition.lng)
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {position ? (
        <p className="mt-1 text-sm text-gray-600">
          Đã chọn: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      ) : (
        <p className="mt-1 text-sm text-gray-500">
          Bấm vào bản đồ để chọn vị trí xảy ra sự cố.
        </p>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

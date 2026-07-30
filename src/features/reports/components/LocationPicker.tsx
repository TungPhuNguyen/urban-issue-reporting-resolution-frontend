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

  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium">
        Vị trí xảy ra sự cố
        <span className="ml-1 text-red-500">*</span>
      </label>

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

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import type { LatLng } from '../reports.types'
import 'leaflet/dist/leaflet.css'

interface LocationPickerProps {
  value: LatLng | null
  onChange: (location: LatLng) => void
  className?: string
}

const DEFAULT_CENTER: [number, number] = [21.0285, 105.8542] // Hà Nội

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function LocationPicker({ value, onChange, className }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    value ? [value.latitude, value.longitude] : null,
  )

  const handlePick = (lat: number, lng: number) => {
    setPosition([lat, lng])
    onChange({ latitude: lat, longitude: lng })
  }

  return (
    <div className={className}>
      <MapContainer
        center={position ?? DEFAULT_CENTER}
        zoom={14}
        style={{ height: '320px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <ClickHandler onPick={handlePick} />
        {position && (
          <Marker
            position={position}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target
                const pos = marker.getLatLng()
                handlePick(pos.lat, pos.lng)
              },
            }}
          />
        )}
      </MapContainer>
      {position && (
        <p style={{ fontSize: 12, marginTop: 4 }}>
          Đã chọn: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      )}
      {!position && (
        <p style={{ fontSize: 12, marginTop: 4 }}>Bấm vào bản đồ để chọn vị trí.</p>
      )}
    </div>
  )
}

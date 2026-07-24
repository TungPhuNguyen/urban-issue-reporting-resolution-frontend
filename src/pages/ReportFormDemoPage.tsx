import { useState } from 'react'
import { CategorySelect } from '@/features/reports/components/CategorySelect'
import { AreaSelect } from '@/features/reports/components/AreaSelect'
import { LocationPicker } from '@/features/reports/components/LocationPicker'
import { ImageUploader } from '@/features/reports/components/ImageUploader'
import type { LatLng } from '@/features/reports/reports.types'

export default function ReportFormDemoPage() {
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [areaId, setAreaId] = useState<number | null>(null)
  const [location, setLocation] = useState<LatLng | null>(null)
  const [images, setImages] = useState<File[]>([])

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '40px auto',
        padding: '0 16px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <h2
        style={{
          color: 'red',
          fontSize: 32,
          fontWeight: 'bold',
        }}
      >
        TEST CODE MỚI
      </h2>

      <h1>Demo form components (UC-06 → UC-09)</h1>

      <div>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Loại sự cố
        </label>

        <CategorySelect
          value={categoryId}
          onChange={setCategoryId}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Khu vực
        </label>

        <AreaSelect
          value={areaId}
          onChange={setAreaId}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Ảnh minh chứng
        </label>

        <ImageUploader
          value={images}
          onChange={setImages}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Vị trí
        </label>

        <LocationPicker
          value={location}
          onChange={setLocation}
        />
      </div>

      
    </div>
  )
}

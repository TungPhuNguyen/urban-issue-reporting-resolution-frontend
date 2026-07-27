import {
  useState,
  type FormEvent,
} from 'react'

import { AreaHierarchySelect } from '@/features/reports/components/AreaHierarchySelect'
import { CategorySelect } from '@/features/reports/components/CategorySelect'
import { ImageUploader } from '@/features/reports/components/ImageUploader'
import { LocationPicker } from '@/features/reports/components/LocationPicker'
import type { LatLng } from '@/features/reports/reports.types'

interface AreaFormValue {
  parentAreaId: number | null
  areaId: number | null
}

export default function ReportFormDemoPage() {
  const [categoryId, setCategoryId] =
    useState<number | null>(null)

  const [areaValue, setAreaValue] =
    useState<AreaFormValue>({
      parentAreaId: null,
      areaId: null,
    })

  const [location, setLocation] =
    useState<LatLng | null>(null)

  const [disabled, setDisabled] =
    useState(false)

  const [locationError, setLocationError] =
    useState<string | undefined>()

  const [images, setImages] =
    useState<File[]>([])

  const [categoryError, setCategoryError] =
    useState<string | undefined>()

  const [
    parentAreaError,
    setParentAreaError,
  ] = useState<string | undefined>()

  const [
    areaError,
    setAreaError,
  ] = useState<string | undefined>()

  function handleAreaChange(
    newAreaValue: AreaFormValue,
  ) {
    setAreaValue(newAreaValue)

    if (newAreaValue.parentAreaId !== null) {
      setParentAreaError(undefined)
    }

    if (newAreaValue.areaId !== null) {
      setAreaError(undefined)
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    let isValid = true

    if (categoryId === null) {
      setCategoryError(
        'Vui lòng chọn loại sự cố.',
      )

      isValid = false
    } else {
      setCategoryError(undefined)
    }

    if (areaValue.parentAreaId === null) {
      setParentAreaError(
        'Vui lòng chọn quận/huyện.',
      )

      isValid = false
    } else {
      setParentAreaError(undefined)
    }

    if (areaValue.areaId === null) {
      setAreaError(
        'Vui lòng chọn phường/xã.',
      )

      isValid = false
    } else {
      setAreaError(undefined)
    }

    if (location === null) {
      setLocationError(
        'Vui lòng chọn vị trí xảy ra sự cố.',
      )

      isValid = false
    } else {
      setLocationError(undefined)
    }

    if (!isValid) {
      return
    }

    console.log({
      categoryId,

      // ID phường/xã gửi lên Create Report API
      areaId: areaValue.areaId,

      location,
      images,
    })

    alert(
      'Category, Area và Location hợp lệ.',
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        maxWidth: 480,
        margin: '40px auto',
        padding: '0 16px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <h1>
        Demo form components (UC-06 → UC-09)
      </h1>

      {/* UC-06: Category */}
      <div>
        <CategorySelect
          value={categoryId}
          onChange={(newCategoryId) => {
            setCategoryId(newCategoryId)

            if (newCategoryId !== null) {
              setCategoryError(undefined)
            }
          }}
          error={categoryError}
        />

        <p>
          Selected Category ID:{' '}
          {categoryId ?? 'Chưa chọn'}
        </p>

        <p>
          Category type:{' '}
          {categoryId === null
            ? 'null'
            : typeof categoryId}
        </p>
      </div>

      {/* UC-07: Area cha-con */}
      <div>
        <AreaHierarchySelect
          value={areaValue}
          onChange={handleAreaChange}
          parentError={parentAreaError}
          areaError={areaError}
        />

        <p>
          Selected Parent Area ID:{' '}
          {areaValue.parentAreaId ??
            'Chưa chọn'}
        </p>

        <p>
          Selected Child Area ID:{' '}
          {areaValue.areaId ??
            'Chưa chọn'}
        </p>

        <p>
          Final Area ID:{' '}
          {areaValue.areaId ??
            'Chưa chọn'}
        </p>

        <p>
          Area type:{' '}
          {areaValue.areaId === null
            ? 'null'
            : typeof areaValue.areaId}
        </p>
      </div>

      {/* UC-09: Images */}
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: 8,
          }}
        >
          Ảnh minh chứng
        </label>

        <ImageUploader
          value={images}
          onChange={setImages}
        />

        <button
          type="button"
          className="rounded bg-red-600 px-4 py-2 text-white"
          onClick={() => {
            setImages([])
          }}
        >
          Reset ảnh từ component cha
        </button>
      </div>

      {/* UC-08: Location */}
      <div>
        <LocationPicker
          value={location}
          onChange={(newLocation) => {
            setLocation(newLocation)
            setLocationError(undefined)
          }}
          disabled={disabled}
          error={locationError}
        />

        <p>
          Latitude:{' '}
          {location
            ? location.latitude.toFixed(6)
            : 'Chưa chọn'}
        </p>

        <p>
          Longitude:{' '}
          {location
            ? location.longitude.toFixed(6)
            : 'Chưa chọn'}
        </p>

        <p>
          Location type:{' '}
          {location
            ? `${typeof location.latitude} / ${typeof location.longitude}`
            : 'null'}
        </p>

        <button
          type="button"
          onClick={() => {
            setLocation(null)
            setLocationError(undefined)
          }}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          Xóa vị trí đã chọn
        </button>

        <button
          type="button"
          onClick={() => {
            setDisabled((current) => !current)
          }}
          style={{
            marginLeft: 8,
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          {disabled
            ? 'Bật bản đồ'
            : 'Khóa bản đồ'}
        </button>
      </div>

      <button
        type="submit"
        style={{
          padding: '10px 16px',
          cursor: 'pointer',
        }}
      >
        Kiểm tra validation
      </button>
    </form>
  )
}
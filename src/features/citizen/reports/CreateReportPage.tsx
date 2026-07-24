import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { reportApi } from './report.api'
import type {
  PublicArea,
  PublicCategory,
} from './report.types'

const MAX_IMAGE_COUNT = 5
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Đã xảy ra lỗi. Vui lòng thử lại.'
}

export default function CreateReportPage() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<PublicCategory[]>(
    [],
  )
  const [areas, setAreas] = useState<PublicArea[]>([])

  const [categoryId, setCategoryId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [description, setDescription] = useState('')
  const [addressText, setAddressText] = useState('')

  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const [images, setImages] = useState<File[]>([])

  const [catalogLoading, setCatalogLoading] = useState(true)
  const [locationLoading, setLocationLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [catalogError, setCatalogError] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCatalogs() {
      setCatalogLoading(true)
      setCatalogError('')

      try {
        const [categoryResult, areaResult] = await Promise.all([
          reportApi.getCategories(),
          reportApi.getAreas(),
        ])

        if (cancelled) {
          return
        }

        setCategories(categoryResult)
        setAreas(areaResult)
      } catch (loadError) {
        if (cancelled) {
          return
        }

        setCatalogError(getErrorMessage(loadError))
      } finally {
        if (!cancelled) {
          setCatalogLoading(false)
        }
      }
    }

    void loadCatalogs()

    return () => {
      cancelled = true
    }
  }, [])

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setError('')

    const selectedFiles = Array.from(
      event.target.files ?? [],
    )

    if (selectedFiles.length > MAX_IMAGE_COUNT) {
      setImages(selectedFiles.slice(0, MAX_IMAGE_COUNT))
      setError('Chỉ được chọn tối đa 5 ảnh.')
      return
    }

    setImages(selectedFiles)
  }

  function getCurrentLocation() {
    setError('')

    if (!navigator.geolocation) {
      setError(
        'Trình duyệt của bạn không hỗ trợ lấy vị trí.',
      )
      return
    }

    setLocationLoading(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(
          position.coords.latitude.toFixed(6),
        )
        setLongitude(
          position.coords.longitude.toFixed(6),
        )
        setLocationLoading(false)
      },
      () => {
        setError(
          'Không lấy được vị trí. Hãy cho phép trình duyệt truy cập vị trí hoặc nhập tọa độ thủ công.',
        )
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0,
      },
    )
  }

  function validateForm(): string | null {
    if (!categoryId) {
      return 'Vui lòng chọn loại sự cố.'
    }

    if (!areaId) {
      return 'Vui lòng chọn khu vực.'
    }

    const trimmedDescription = description.trim()

    if (!trimmedDescription) {
      return 'Mô tả sự cố không được để trống.'
    }

    if (trimmedDescription.length < 10) {
      return 'Mô tả sự cố phải có ít nhất 10 ký tự.'
    }

    if (trimmedDescription.length > 2000) {
      return 'Mô tả sự cố không được vượt quá 2000 ký tự.'
    }

    if (addressText.trim().length > 500) {
      return 'Địa chỉ không được vượt quá 500 ký tự.'
    }

    if (!latitude.trim()) {
      return 'Vui lòng nhập vĩ độ hoặc lấy vị trí hiện tại.'
    }

    if (!longitude.trim()) {
      return 'Vui lòng nhập kinh độ hoặc lấy vị trí hiện tại.'
    }

    const latitudeNumber = Number(latitude)
    const longitudeNumber = Number(longitude)

    if (
      Number.isNaN(latitudeNumber) ||
      latitudeNumber < -90 ||
      latitudeNumber > 90
    ) {
      return 'Vĩ độ phải nằm trong khoảng từ -90 đến 90.'
    }

    if (
      Number.isNaN(longitudeNumber) ||
      longitudeNumber < -180 ||
      longitudeNumber > 180
    ) {
      return 'Kinh độ phải nằm trong khoảng từ -180 đến 180.'
    }

    if (
      images.length < 1 ||
      images.length > MAX_IMAGE_COUNT
    ) {
      return 'Báo cáo phải có từ 1 đến 5 ảnh.'
    }

    const invalidTypeImage = images.find(
      (image) => !ALLOWED_IMAGE_TYPES.has(image.type),
    )

    if (invalidTypeImage) {
      return `Ảnh "${invalidTypeImage.name}" không hợp lệ. Chỉ hỗ trợ JPG, PNG và WEBP.`
    }

    const oversizedImage = images.find(
      (image) => image.size > MAX_IMAGE_SIZE,
    )

    if (oversizedImage) {
      return `Ảnh "${oversizedImage.name}" vượt quá 5 MB.`
    }

    const emptyImage = images.find(
      (image) => image.size === 0,
    )

    if (emptyImage) {
      return `Ảnh "${emptyImage.name}" đang bị rỗng.`
    }

    return null
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError('')

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)

    try {
      const result = await reportApi.createReport({
        categoryId: Number(categoryId),
        areaId: Number(areaId),
        description: description.trim(),
        addressText: addressText.trim() || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
        images,
      })

      navigate(`/citizen/reports/${result.id}`, {
        replace: true,
        state: {
          created: true,
        },
      })
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tạo phản ánh mới
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Cung cấp đầy đủ thông tin và ảnh về sự cố hạ
            tầng.
          </p>
        </div>

        <Link
          to="/citizen/reports"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Quay lại
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="categoryId"
              className="text-sm font-medium text-gray-700"
            >
              Loại sự cố{' '}
              <span className="text-red-600">*</span>
            </label>

            <select
              id="categoryId"
              value={categoryId}
              disabled={catalogLoading || submitting}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              className={inputClass}
            >
              <option value="">
                {catalogLoading
                  ? 'Đang tải loại sự cố...'
                  : 'Chọn loại sự cố'}
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="areaId"
              className="text-sm font-medium text-gray-700"
            >
              Khu vực{' '}
              <span className="text-red-600">*</span>
            </label>

            <select
              id="areaId"
              value={areaId}
              disabled={catalogLoading || submitting}
              onChange={(event) =>
                setAreaId(event.target.value)
              }
              className={inputClass}
            >
              <option value="">
                {catalogLoading
                  ? 'Đang tải khu vực...'
                  : 'Chọn khu vực'}
              </option>

              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} ({area.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {catalogError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Không tải được Category hoặc Area:{' '}
            {catalogError}
          </div>
        )}

        <div>
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            Mô tả sự cố{' '}
            <span className="text-red-600">*</span>
          </label>

          <textarea
            id="description"
            rows={6}
            value={description}
            disabled={submitting}
            maxLength={2000}
            placeholder="Ví dụ: Mặt đường xuất hiện ổ gà lớn, gây nguy hiểm cho người tham gia giao thông..."
            onChange={(event) =>
              setDescription(event.target.value)
            }
            className={inputClass}
          />

          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Tối thiểu 10 ký tự</span>
            <span>{description.length}/2000</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="addressText"
            className="text-sm font-medium text-gray-700"
          >
            Địa chỉ mô tả
          </label>

          <input
            id="addressText"
            type="text"
            value={addressText}
            disabled={submitting}
            maxLength={500}
            placeholder="Ví dụ: Trước số 123 đường Nguyễn Văn Linh"
            onChange={(event) =>
              setAddressText(event.target.value)
            }
            className={inputClass}
          />

          <p className="mt-1 text-xs text-gray-500">
            Trường này không bắt buộc, tối đa 500 ký tự.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">
                Vị trí sự cố
              </h2>

              <p className="text-sm text-gray-500">
                Sử dụng vị trí hiện tại hoặc nhập tọa độ
                thủ công.
              </p>
            </div>

            <button
              type="button"
              disabled={locationLoading || submitting}
              onClick={getCurrentLocation}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {locationLoading
                ? 'Đang lấy vị trí...'
                : 'Lấy vị trí hiện tại'}
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="latitude"
                className="text-sm font-medium text-gray-700"
              >
                Vĩ độ{' '}
                <span className="text-red-600">*</span>
              </label>

              <input
                id="latitude"
                type="number"
                step="any"
                min={-90}
                max={90}
                value={latitude}
                disabled={submitting}
                placeholder="Ví dụ: 10.762622"
                onChange={(event) =>
                  setLatitude(event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="longitude"
                className="text-sm font-medium text-gray-700"
              >
                Kinh độ{' '}
                <span className="text-red-600">*</span>
              </label>

              <input
                id="longitude"
                type="number"
                step="any"
                min={-180}
                max={180}
                value={longitude}
                disabled={submitting}
                placeholder="Ví dụ: 106.660172"
                onChange={(event) =>
                  setLongitude(event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="images"
            className="text-sm font-medium text-gray-700"
          >
            Ảnh sự cố{' '}
            <span className="text-red-600">*</span>
          </label>

          <input
            id="images"
            type="file"
            multiple
            disabled={submitting}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />

          <p className="mt-2 text-xs text-gray-500">
            Chọn từ 1 đến 5 ảnh. Chỉ nhận JPG, PNG hoặc
            WEBP. Mỗi ảnh tối đa 5 MB.
          </p>

          {images.length > 0 && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Đã chọn {images.length} ảnh:
              </p>

              <ul className="space-y-1 text-sm text-gray-600">
                {images.map((image) => (
                  <li
                    key={`${image.name}-${image.lastModified}`}
                    className="flex justify-between gap-3"
                  >
                    <span className="truncate">
                      {image.name}
                    </span>

                    <span className="shrink-0">
                      {(image.size / 1024 / 1024).toFixed(
                        2,
                      )}{' '}
                      MB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
          <Link
            to="/citizen/reports"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </Link>

          <button
            type="submit"
            disabled={submitting || catalogLoading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? 'Đang gửi phản ánh...'
              : 'Gửi phản ánh'}
          </button>
        </div>
      </form>
    </div>
  )
}
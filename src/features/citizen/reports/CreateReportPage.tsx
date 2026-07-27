import {
  useState,
  type FormEvent,
} from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { AreaHierarchySelect } from '@/features/reports/components/AreaHierarchySelect'
import { CategorySelect } from '@/features/reports/components/CategorySelect'
import { ImageUploader } from '@/features/reports/components/ImageUploader'
import { LocationPicker } from '@/features/reports/components/LocationPicker'
import type { LatLng } from '@/features/reports/report-form.types'

import { citizenReportApi } from './citizen-report.api'

interface AreaSelection {
  parentAreaId: number | null
  areaId: number | null
}

interface FormErrors {
  categoryId?: string
  parentAreaId?: string
  areaId?: string
  description?: string
  addressText?: string
  location?: string
  images?: string
}

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

  const [categoryId, setCategoryId] =
    useState<number | null>(null)

  const [selectedArea, setSelectedArea] =
    useState<AreaSelection>({
      parentAreaId: null,
      areaId: null,
    })

  const [description, setDescription] =
    useState('')

  const [addressText, setAddressText] =
    useState('')

  const [location, setLocation] =
    useState<LatLng | null>(null)

  const [images, setImages] =
    useState<File[]>([])

  const [formErrors, setFormErrors] =
    useState<FormErrors>({})

  const [submitError, setSubmitError] =
    useState('')

  const [submitting, setSubmitting] =
    useState(false)

  function clearFieldError(
    field: keyof FormErrors,
  ) {
    setFormErrors((current) => ({
      ...current,
      [field]: undefined,
    }))
  }

  function validateForm(): boolean {
    const errors: FormErrors = {}

    const trimmedDescription =
      description.trim()

    const trimmedAddress =
      addressText.trim()

    if (categoryId === null) {
      errors.categoryId =
        'Vui lòng chọn loại sự cố.'
    }

    if (selectedArea.parentAreaId === null) {
      errors.parentAreaId =
        'Vui lòng chọn Quận/Huyện.'
    } else if (selectedArea.areaId === null) {
      errors.areaId =
        'Vui lòng chọn Phường/Xã.'
    }

    if (!trimmedDescription) {
      errors.description =
        'Mô tả sự cố không được để trống.'
    } else if (
      trimmedDescription.length < 10
    ) {
      errors.description =
        'Mô tả sự cố phải có ít nhất 10 ký tự.'
    } else if (
      trimmedDescription.length > 2000
    ) {
      errors.description =
        'Mô tả sự cố không được vượt quá 2000 ký tự.'
    }

    if (trimmedAddress.length > 500) {
      errors.addressText =
        'Địa chỉ không được vượt quá 500 ký tự.'
    }

    if (location === null) {
      errors.location =
        'Vui lòng chọn vị trí xảy ra sự cố trên bản đồ.'
    }

    if (images.length === 0) {
      errors.images =
        'Vui lòng chọn ít nhất một ảnh.'
    } else if (images.length > 5) {
      errors.images =
        'Chỉ được chọn tối đa 5 ảnh.'
    }

    setFormErrors(errors)

    return Object.keys(errors).length === 0
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (submitting) {
      return
    }

    setSubmitError('')

    const isValid = validateForm()

    if (
      !isValid ||
      categoryId === null ||
      selectedArea.areaId === null ||
      location === null
    ) {
      return
    }

    setSubmitting(true)

    try {
      const result =
        await citizenReportApi.createReport({
          categoryId,
          areaId: selectedArea.areaId,
          description: description.trim(),
          addressText:
            addressText.trim() || undefined,
          latitude: location.latitude,
          longitude: location.longitude,
          images,
        })

      navigate(
        `/citizen/reports/${result.id}`,
        {
          replace: true,
          state: {
            created: true,
          },
        },
      )
    } catch (error) {
      setSubmitError(
        getErrorMessage(error),
      )
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
            Cung cấp đầy đủ thông tin, vị trí
            và hình ảnh về sự cố hạ tầng.
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
        noValidate
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Category */}
        <CategorySelect
          id="categoryId"
          value={categoryId}
          disabled={submitting}
          error={formErrors.categoryId}
          onChange={(value) => {
            setCategoryId(value)
            clearFieldError('categoryId')
          }}
        />

        {/* Area hierarchy */}
        <section>
          <h2 className="mb-3 font-semibold text-gray-900">
            Khu vực xảy ra sự cố
          </h2>

          <AreaHierarchySelect
            value={selectedArea}
            disabled={submitting}
            parentError={
              formErrors.parentAreaId
            }
            areaError={formErrors.areaId}
            onChange={(value) => {
              setSelectedArea(value)

              setFormErrors((current) => ({
                ...current,
                parentAreaId: undefined,
                areaId: undefined,
              }))
            }}
          />
        </section>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            Mô tả sự cố
            <span className="ml-1 text-red-600">
              *
            </span>
          </label>

          <textarea
            id="description"
            rows={6}
            value={description}
            disabled={submitting}
            maxLength={2000}
            placeholder="Ví dụ: Mặt đường xuất hiện ổ gà lớn, gây nguy hiểm cho người tham gia giao thông..."
            onChange={(event) => {
              setDescription(
                event.target.value,
              )

              clearFieldError(
                'description',
              )
            }}
            className={[
              inputClass,
              formErrors.description
                ? 'border-red-500'
                : '',
            ].join(' ')}
            aria-invalid={Boolean(
              formErrors.description,
            )}
            aria-describedby={
              formErrors.description
                ? 'description-error'
                : undefined
            }
          />

          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Tối thiểu 10 ký tự</span>

            <span>
              {description.length}/2000
            </span>
          </div>

          {formErrors.description && (
            <p
              id="description-error"
              className="mt-1 text-sm text-red-600"
            >
              {formErrors.description}
            </p>
          )}
        </div>

        {/* Address text */}
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
            onChange={(event) => {
              setAddressText(
                event.target.value,
              )

              clearFieldError(
                'addressText',
              )
            }}
            className={[
              inputClass,
              formErrors.addressText
                ? 'border-red-500'
                : '',
            ].join(' ')}
            aria-invalid={Boolean(
              formErrors.addressText,
            )}
            aria-describedby={
              formErrors.addressText
                ? 'addressText-error'
                : undefined
            }
          />

          <p className="mt-1 text-xs text-gray-500">
            Trường này không bắt buộc, tối đa
            500 ký tự.
          </p>

          {formErrors.addressText && (
            <p
              id="addressText-error"
              className="mt-1 text-sm text-red-600"
            >
              {formErrors.addressText}
            </p>
          )}
        </div>

        {/* Location */}
        <section>
          <div className="mb-3">
            <h2 className="font-semibold text-gray-900">
              Chọn vị trí sự cố
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Bấm vào bản đồ hoặc kéo marker
              để chọn chính xác vị trí xảy ra
              sự cố.
            </p>
          </div>

          <LocationPicker
            value={location}
            disabled={submitting}
            error={formErrors.location}
            onChange={(value) => {
              setLocation(value)
              clearFieldError('location')
            }}
          />
        </section>

        {/* Images */}
        <section>
          <ImageUploader
            value={images}
            maxFiles={5}
            maxSizeMb={5}
            disabled={submitting}
            error={formErrors.images}
            onChange={(value) => {
              setImages(value)

              if (value.length > 0) {
                clearFieldError('images')
              }
            }}
          />
        </section>

        {/* API error */}
        {submitError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {submitError}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
          <Link
            to="/citizen/reports"
            className={[
              'rounded-lg border border-gray-300',
              'bg-white px-5 py-2.5 text-sm',
              'font-medium text-gray-700',
              'hover:bg-gray-50',
              submitting
                ? 'pointer-events-none opacity-60'
                : '',
            ].join(' ')}
          >
            Hủy
          </Link>

          <button
            type="submit"
            disabled={submitting}
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
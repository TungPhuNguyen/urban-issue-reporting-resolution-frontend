import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AreaHierarchySelect } from '@/features/reports/components/AreaHierarchySelect'
import { CategorySelect } from '@/features/reports/components/CategorySelect'
import { ImageUploader } from '@/features/reports/components/ImageUploader'
import { LocationPicker } from '@/features/reports/components/LocationPicker'
import type { LatLng } from '@/features/reports/report-form.types'
import {
  usePublicCategories,
  useResolvedArea,
} from '@/features/public-catalog/public-catalog.queries'

import { DuplicateReportsDialog } from './DuplicateReportsDialog'
import { citizenReportApi } from './citizen-report.api'
import type {
  CheckDuplicateReportsResult,
  CreateReportRequest,
} from './citizen-report.types'

interface AreaSelection {
  parentAreaId: number | null
  areaId: number | null
}

interface FormErrors {
  title?: string
  categoryId?: string
  otherCategoryText?: string
  parentAreaId?: string
  areaId?: string
  description?: string
  addressText?: string
  location?: string
  images?: string
}

type SubmitStage = 'idle' | 'checking' | 'creating'

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

  const [categoryId, setCategoryId] = useState<number | null>(null)

  const [title, setTitle] = useState('')

  const [otherCategoryText, setOtherCategoryText] = useState('')

  const [selectedArea, setSelectedArea] = useState<AreaSelection>({
    parentAreaId: null,
    areaId: null,
  })

  const [description, setDescription] = useState('')

  const [addressText, setAddressText] = useState('')

  const [location, setLocation] = useState<LatLng | null>(null)

  const [images, setImages] = useState<File[]>([])

  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const [submitError, setSubmitError] = useState('')

  const [submitStage, setSubmitStage] = useState<SubmitStage>('idle')

  const [duplicateResult, setDuplicateResult] =
    useState<CheckDuplicateReportsResult | null>(null)

  const [pendingReport, setPendingReport] = useState<CreateReportRequest | null>(null)

  const submitting = submitStage !== 'idle'

  const categoriesQuery = usePublicCategories()
  const resolvedAreaQuery = useResolvedArea(
    location?.latitude ?? null,
    location?.longitude ?? null,
    Boolean(location),
  )
  const selectedCategory = categoriesQuery.data?.find(
    (category) => category.id === categoryId,
  )
  const isOtherCategory =
    selectedCategory?.name.trim().toLocaleLowerCase('vi-VN') === 'khác' ||
    selectedCategory?.name.trim().toLowerCase() === 'other'

  useEffect(() => {
    if (!resolvedAreaQuery.data) return

    setSelectedArea({
      parentAreaId: resolvedAreaQuery.data.districtId,
      areaId: resolvedAreaQuery.data.areaId,
    })
    setFormErrors((current) => ({
      ...current,
      parentAreaId: undefined,
      areaId: undefined,
      location: undefined,
    }))
  }, [resolvedAreaQuery.data])

  function clearFieldError(field: keyof FormErrors) {
    setFormErrors((current) => ({
      ...current,
      [field]: undefined,
    }))
  }

  function validateForm(): boolean {
    const errors: FormErrors = {}

    const trimmedDescription = description.trim()

    const trimmedTitle = title.trim()

    const trimmedAddress = addressText.trim()

    if (trimmedTitle.length < 10) {
      errors.title = 'Tiêu đề phải có ít nhất 10 ký tự.'
    } else if (trimmedTitle.length > 150) {
      errors.title = 'Tiêu đề không được vượt quá 150 ký tự.'
    }

    if (categoryId === null) {
      errors.categoryId = 'Vui lòng chọn loại sự cố.'
    }

    if (isOtherCategory && !otherCategoryText.trim()) {
      errors.otherCategoryText = 'Vui lòng mô tả loại sự cố cụ thể.'
    } else if (otherCategoryText.trim().length > 250) {
      errors.otherCategoryText = 'Loại sự cố cụ thể không được vượt quá 250 ký tự.'
    }

    if (selectedArea.parentAreaId === null) {
      errors.parentAreaId = 'Vui lòng chọn Quận/Huyện.'
    } else if (selectedArea.areaId === null) {
      errors.areaId = 'Vui lòng chọn Phường/Xã.'
    }

    if (!trimmedDescription) {
      errors.description = 'Mô tả sự cố không được để trống.'
    } else if (trimmedDescription.length < 10) {
      errors.description = 'Mô tả sự cố phải có ít nhất 10 ký tự.'
    } else if (trimmedDescription.length > 2000) {
      errors.description = 'Mô tả sự cố không được vượt quá 2000 ký tự.'
    }

    if (trimmedAddress.length > 500) {
      errors.addressText = 'Địa chỉ không được vượt quá 500 ký tự.'
    }

    if (location === null) {
      errors.location = 'Vui lòng chọn vị trí xảy ra sự cố trên bản đồ.'
    } else if (resolvedAreaQuery.isError) {
      errors.location = 'Không xác định được phường/xã từ tọa độ đã chọn.'
    } else if (
      resolvedAreaQuery.data &&
      selectedArea.areaId !== resolvedAreaQuery.data.areaId
    ) {
      errors.location = 'Tọa độ không thuộc phường/xã đã chọn.'
    }

    if (images.length === 0) {
      errors.images = 'Vui lòng chọn ít nhất một ảnh.'
    } else if (images.length > 5) {
      errors.images = 'Chỉ được chọn tối đa 5 ảnh.'
    }

    setFormErrors(errors)

    return Object.keys(errors).length === 0
  }

  async function createReport(payload: CreateReportRequest) {
    const result = await citizenReportApi.createReport(payload)

    navigate(`/citizen/reports/${result.id}`, {
      replace: true,
      state: {
        created: true,
      },
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    const payload: CreateReportRequest = {
      categoryId,
      areaId: selectedArea.areaId,
      title: title.trim(),
      description: description.trim(),
      otherCategoryText: isOtherCategory
        ? otherCategoryText.trim() || undefined
        : undefined,
      addressText: addressText.trim() || undefined,
      latitude: location.latitude,
      longitude: location.longitude,
      images,
    }

    setSubmitStage('checking')

    try {
      const duplicateCheck = await citizenReportApi.checkDuplicates({
        categoryId,
        latitude: location.latitude,
        longitude: location.longitude,
      })

      if (duplicateCheck.hasPossibleDuplicates && duplicateCheck.reports.length > 0) {
        setPendingReport(payload)
        setDuplicateResult(duplicateCheck)
        return
      }

      setSubmitStage('creating')
      await createReport(payload)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setSubmitStage('idle')
    }
  }

  async function handleConfirmCreate() {
    if (!pendingReport || submitting) {
      return
    }

    setSubmitError('')
    setSubmitStage('creating')

    try {
      await createReport({
        ...pendingReport,
        confirmPossibleDuplicate: true,
      })
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setSubmitStage('idle')
    }
  }

  function handleDismissDuplicates() {
    if (submitting) {
      return
    }

    setDuplicateResult(null)
    setPendingReport(null)
    setSubmitError('')
  }

  return (
    <div className="create-report-page mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo phản ánh mới</h1>

          <p className="mt-1 text-sm text-gray-600">
            Cung cấp đầy đủ thông tin, vị trí và hình ảnh về sự cố hạ tầng.
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
        <div>
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            Tiêu đề phản ánh <span className="ml-1 text-red-600">*</span>
          </label>
          <input
            id="title"
            value={title}
            maxLength={150}
            disabled={submitting}
            placeholder="Ví dụ: Ổ gà lớn trước cổng trường học"
            onChange={(event) => {
              setTitle(event.target.value)
              clearFieldError('title')
            }}
            className={[inputClass, formErrors.title ? 'border-red-500' : ''].join(' ')}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Từ 10 đến 150 ký tự</span>
            <span>{title.length}/150</span>
          </div>
          {formErrors.title && (
            <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
          )}
        </div>

        {/* Category */}
        <CategorySelect
          id="categoryId"
          value={categoryId}
          disabled={submitting}
          error={formErrors.categoryId}
          onChange={(value) => {
            setCategoryId(value)
            setOtherCategoryText('')
            clearFieldError('categoryId')
          }}
        />

        {isOtherCategory && (
          <div>
            <label
              htmlFor="otherCategoryText"
              className="text-sm font-medium text-gray-700"
            >
              Loại sự cố cụ thể <span className="ml-1 text-red-600">*</span>
            </label>
            <input
              id="otherCategoryText"
              value={otherCategoryText}
              maxLength={250}
              disabled={submitting}
              placeholder="Mô tả ngắn loại sự cố cần Admin phân loại"
              onChange={(event) => {
                setOtherCategoryText(event.target.value)
                clearFieldError('otherCategoryText')
              }}
              className={[
                inputClass,
                formErrors.otherCategoryText ? 'border-red-500' : '',
              ].join(' ')}
            />
            {formErrors.otherCategoryText && (
              <p className="mt-1 text-sm text-red-600">{formErrors.otherCategoryText}</p>
            )}
          </div>
        )}

        {/* Area hierarchy */}
        <section>
          <h2 className="mb-3 font-semibold text-gray-900">Khu vực xảy ra sự cố</h2>

          <AreaHierarchySelect
            value={selectedArea}
            disabled={submitting}
            parentError={formErrors.parentAreaId}
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
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Mô tả sự cố
            <span className="ml-1 text-red-600">*</span>
          </label>

          <textarea
            id="description"
            rows={6}
            value={description}
            disabled={submitting}
            maxLength={2000}
            placeholder="Ví dụ: Mặt đường xuất hiện ổ gà lớn, gây nguy hiểm cho người tham gia giao thông..."
            onChange={(event) => {
              setDescription(event.target.value)

              clearFieldError('description')
            }}
            className={[inputClass, formErrors.description ? 'border-red-500' : ''].join(
              ' ',
            )}
            aria-invalid={Boolean(formErrors.description)}
            aria-describedby={formErrors.description ? 'description-error' : undefined}
          />

          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Tối thiểu 10 ký tự</span>

            <span>{description.length}/2000</span>
          </div>

          {formErrors.description && (
            <p id="description-error" className="mt-1 text-sm text-red-600">
              {formErrors.description}
            </p>
          )}
        </div>

        {/* Address text */}
        <div>
          <label htmlFor="addressText" className="text-sm font-medium text-gray-700">
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
              setAddressText(event.target.value)

              clearFieldError('addressText')
            }}
            className={[inputClass, formErrors.addressText ? 'border-red-500' : ''].join(
              ' ',
            )}
            aria-invalid={Boolean(formErrors.addressText)}
            aria-describedby={formErrors.addressText ? 'addressText-error' : undefined}
          />

          <p className="mt-1 text-xs text-gray-500">
            Trường này không bắt buộc, tối đa 500 ký tự.
          </p>

          {formErrors.addressText && (
            <p id="addressText-error" className="mt-1 text-sm text-red-600">
              {formErrors.addressText}
            </p>
          )}
        </div>

        {/* Location */}
        <section>
          <div className="mb-3">
            <h2 className="font-semibold text-gray-900">Chọn vị trí sự cố</h2>

            <p className="mt-1 text-sm text-gray-500">
              Bấm vào bản đồ hoặc kéo marker để chọn chính xác vị trí xảy ra sự cố.
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

          {resolvedAreaQuery.isFetching && (
            <p className="mt-2 text-sm text-blue-600">
              Đang xác định phường/xã từ vị trí...
            </p>
          )}
          {resolvedAreaQuery.data && (
            <p className="mt-2 text-sm text-green-700">
              Đã tự chọn {resolvedAreaQuery.data.areaName},{' '}
              {resolvedAreaQuery.data.districtName}.
            </p>
          )}
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
              submitting ? 'pointer-events-none opacity-60' : '',
            ].join(' ')}
          >
            Hủy
          </Link>

          <button
            type="submit"
            disabled={submitting || resolvedAreaQuery.isFetching}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitStage === 'checking'
              ? 'Đang kiểm tra trùng...'
              : submitStage === 'creating'
                ? 'Đang gửi phản ánh...'
                : 'Gửi phản ánh'}
          </button>
        </div>
      </form>

      {duplicateResult && (
        <DuplicateReportsDialog
          result={duplicateResult}
          isCreating={submitStage === 'creating'}
          error={submitError || undefined}
          onCancel={handleDismissDuplicates}
          onConfirm={handleConfirmCreate}
        />
      )}
    </div>
  )
}

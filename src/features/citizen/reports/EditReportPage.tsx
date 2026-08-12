import { ArrowLeft, MapPin, Save } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import {
  usePublicCategories,
  useResolvedArea,
} from '@/features/public-catalog/public-catalog.queries'
import { CategorySelect } from '@/features/reports/components/CategorySelect'
import { LocationPicker } from '@/features/reports/components/LocationPicker'
import type { LatLng } from '@/features/reports/report-form.types'
import { ApiError } from '@/lib/api/http'

import { useCitizenReportDetail, useUpdateCitizenReport } from './citizen-report.queries'

interface FormState {
  title: string
  categoryId: number | null
  otherCategoryText: string
  parentAreaId: number | null
  areaId: number | null
  description: string
  addressText: string
  location: LatLng | null
}

const EMPTY_FORM: FormState = {
  title: '',
  categoryId: null,
  otherCategoryText: '',
  parentAreaId: null,
  areaId: null,
  description: '',
  addressText: '',
  location: null,
}

export default function EditReportPage() {
  const { reportId = '' } = useParams()
  const navigate = useNavigate()
  const initialized = useRef(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [needsDuplicateConfirmation, setNeedsDuplicateConfirmation] = useState(false)
  const reportQuery = useCitizenReportDetail(reportId)
  const categoriesQuery = usePublicCategories()
  const updateMutation = useUpdateCitizenReport()
  const resolvedAreaQuery = useResolvedArea(
    form.location?.latitude ?? null,
    form.location?.longitude ?? null,
    Boolean(form.location),
  )
  const selectedCategory = useMemo(
    () => categoriesQuery.data?.find((category) => category.id === form.categoryId),
    [categoriesQuery.data, form.categoryId],
  )
  const isOtherCategory =
    selectedCategory?.name.trim().toLocaleLowerCase('vi-VN') === 'khác' ||
    selectedCategory?.name.trim().toLowerCase() === 'other'

  useEffect(() => {
    const report = reportQuery.data
    if (!report || initialized.current) return
    initialized.current = true
    setForm({
      title: report.title,
      categoryId: report.categoryId,
      otherCategoryText: report.otherCategoryText ?? '',
      parentAreaId: null,
      areaId: report.areaId,
      description: report.description,
      addressText: report.addressText ?? '',
      location: { latitude: report.latitude, longitude: report.longitude },
    })
  }, [reportQuery.data])

  useEffect(() => {
    if (!resolvedAreaQuery.data) return
    setForm((current) => ({
      ...current,
      parentAreaId: resolvedAreaQuery.data.districtId,
      areaId: resolvedAreaQuery.data.areaId,
    }))
  }, [resolvedAreaQuery.data])

  async function save(confirmPossibleDuplicate: boolean) {
    const report = reportQuery.data
    if (!report || !form.categoryId || !form.location) return

    if (!form.areaId) {
      setError('Vui lòng chờ hệ thống xác định phường/xã từ vị trí đã chọn.')
      return
    }

    const title = form.title.trim()
    const description = form.description.trim()
    if (title.length < 10 || title.length > 150) {
      setError('Tiêu đề phải có từ 10 đến 150 ký tự.')
      return
    }
    if (description.length < 10 || description.length > 2000) {
      setError('Mô tả phải có từ 10 đến 2000 ký tự.')
      return
    }
    if (isOtherCategory && !form.otherCategoryText.trim()) {
      setError('Vui lòng mô tả loại sự cố cụ thể.')
      return
    }

    setError(null)
    try {
      await updateMutation.mutateAsync({
        reportId,
        categoryId: form.categoryId,
        areaId: form.areaId,
        title,
        description,
        otherCategoryText: isOtherCategory ? form.otherCategoryText.trim() : undefined,
        addressText: form.addressText.trim() || undefined,
        latitude: form.location.latitude,
        longitude: form.location.longitude,
        confirmPossibleDuplicate,
        rowVersion: report.rowVersion,
      })
      navigate(`/citizen/reports/${reportId}`, { replace: true })
    } catch (requestError) {
      if (
        requestError instanceof ApiError &&
        requestError.status === 409 &&
        !confirmPossibleDuplicate
      ) {
        setNeedsDuplicateConfirmation(true)
        setError(
          'Nội dung mới có thể trùng với báo cáo khác. Hãy xác nhận nếu vẫn muốn lưu.',
        )
      } else {
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'Không thể cập nhật báo cáo.',
        )
      }
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void save(false)
  }

  if (reportQuery.isPending)
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  if (reportQuery.isError || !reportQuery.data)
    return <Card className="p-8 text-center text-red-600">Không thể tải báo cáo.</Card>
  if (!reportQuery.data.allowedActions.canEdit)
    return (
      <Card className="p-8 text-center">Báo cáo này không còn được phép chỉnh sửa.</Card>
    )

  return (
    <section className="create-report-page mx-auto max-w-4xl">
      <Link className="back-link" to={`/citizen/reports/${reportId}`}>
        <ArrowLeft aria-hidden="true" size={17} /> Chi tiết báo cáo
      </Link>

      <div className="page-heading">
        <div>
          <Badge variant="info">Bản nháp cập nhật</Badge>
          <h1>Chỉnh sửa báo cáo</h1>
          <p>
            {reportQuery.data.reportCode} · Cập nhật thông tin, khu vực và vị trí sự cố.
          </p>
        </div>
      </div>
      <Card className="panel create-report-form edit-report-form">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <header className="form-section__header">
            <span>
              <MapPin aria-hidden="true" />
            </span>
            <div>
              <h2>Thông tin báo cáo</h2>
              <p>Hình ảnh hiện trường hiện có sẽ được giữ nguyên.</p>
            </div>
          </header>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Tiêu đề
            <input
              value={form.title}
              maxLength={150}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="h-10 rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <CategorySelect
            value={form.categoryId}
            onChange={(categoryId) =>
              setForm((f) => ({ ...f, categoryId, otherCategoryText: '' }))
            }
          />
          {isOtherCategory && (
            <label className="flex flex-col gap-1 text-sm font-medium">
              Loại sự cố cụ thể
              <input
                value={form.otherCategoryText}
                maxLength={250}
                onChange={(e) =>
                  setForm((f) => ({ ...f, otherCategoryText: e.target.value }))
                }
                className="h-10 rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-900"
              />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm font-medium">
            Mô tả
            <textarea
              value={form.description}
              rows={6}
              maxLength={2000}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <section className="form-section">
            <header className="form-section__header">
              <span><MapPin aria-hidden="true" /></span>
              <div>
                <h2>Khu vực xảy ra sự cố</h2>
                <p>Khu vực được tự động xác định từ tọa độ đã chọn trên bản đồ.</p>
              </div>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Thành phố</p>
                <div className="mt-1 flex min-h-10 items-center rounded-lg border border-gray-300 bg-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {resolvedAreaQuery.isFetching ? 'Đang xác định...' : (resolvedAreaQuery.data?.districtName ?? 'Chưa chọn tọa độ')}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phường/Xã</p>
                <div className="mt-1 flex min-h-10 items-center rounded-lg border border-gray-300 bg-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {resolvedAreaQuery.isFetching ? 'Đang xác định...' : (resolvedAreaQuery.data?.areaName ?? 'Chưa chọn tọa độ')}
                </div>
              </div>
            </div>
          </section>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Địa chỉ mô tả
            <input
              value={form.addressText}
              maxLength={500}
              onChange={(e) => setForm((f) => ({ ...f, addressText: e.target.value }))}
              className="h-10 rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <section className="form-section">
            <div className="mb-3">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Chọn vị trí sự cố
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Bấm vào bản đồ hoặc kéo marker để chọn chính xác vị trí xảy ra sự cố.
              </p>
            </div>

            <LocationPicker
              value={form.location}
              onChange={(location) =>
                setForm((f) => ({ ...f, location, parentAreaId: null, areaId: null }))
              }
            />

            {resolvedAreaQuery.isFetching && (
              <p className="mt-2 text-sm text-blue-600">Đang xác định phường/xã từ vị trí...</p>
            )}
            {form.location !== null && resolvedAreaQuery.isError && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                Không xác định được phường/xã từ tọa độ này. Vui lòng chọn vị trí khác.
              </p>
            )}
            {resolvedAreaQuery.data && (
              <p className="mt-2 text-sm text-green-700">
                Đã tự chọn {resolvedAreaQuery.data.areaName}, {resolvedAreaQuery.data.districtName}.
              </p>
            )}
          </section>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              loading={updateMutation.isPending}
              disabled={resolvedAreaQuery.isFetching}
            >
              <Save aria-hidden="true" size={17} />
              Lưu thay đổi
            </Button>
            {needsDuplicateConfirmation && (
              <Button
                type="button"
                variant="danger"
                loading={updateMutation.isPending}
                onClick={() => void save(true)}
              >
                Vẫn lưu báo cáo
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/citizen/reports/${reportId}`)}
            >
              Hủy
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}

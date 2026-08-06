import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import {
  usePublicCategories,
  useResolvedArea,
} from '@/features/public-catalog/public-catalog.queries'
import { AreaHierarchySelect } from '@/features/reports/components/AreaHierarchySelect'
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
    if (!report || !form.categoryId || !form.areaId || !form.location) return

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
    <section className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Chỉnh sửa báo cáo</h1>
          <p className="text-sm text-gray-500">{reportQuery.data.reportCode}</p>
        </div>
        <Link
          to={`/citizen/reports/${reportId}`}
          className="text-sm text-blue-600 hover:underline"
        >
          Quay lại
        </Link>
      </div>
      <Card className="mt-6 p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
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
          <AreaHierarchySelect
            value={{ parentAreaId: form.parentAreaId, areaId: form.areaId }}
            onChange={(area) => setForm((f) => ({ ...f, ...area }))}
          />
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
          <label className="flex flex-col gap-1 text-sm font-medium">
            Địa chỉ mô tả
            <input
              value={form.addressText}
              maxLength={500}
              onChange={(e) => setForm((f) => ({ ...f, addressText: e.target.value }))}
              className="h-10 rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <LocationPicker
            value={form.location}
            onChange={(location) => setForm((f) => ({ ...f, location }))}
          />
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={updateMutation.isPending}>
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

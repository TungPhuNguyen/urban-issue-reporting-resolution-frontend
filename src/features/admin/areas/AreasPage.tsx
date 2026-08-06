import { type FormEvent, useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { ApiError } from '@/lib/api/http'
import { parseApiDateTime } from '@/lib/utils/date-time'

import {
  useAreaBoundary,
  useAreas,
  useCreateArea,
  useDeleteArea,
  useUpdateArea,
  useUpdateAreaBoundary,
} from './areas.queries'

import type { Area, AreaListParams } from './areas.types'

const PAGE_SIZE = 10

interface AreaFormState {
  name: string
  code: string
  parentAreaId: string
  isActive: boolean
}

const EMPTY_FORM: AreaFormState = {
  name: '',
  code: '',
  parentAreaId: '',
  isActive: true,
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Chưa có'
  }

  const date = parseApiDateTime(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export default function AreasPage() {
  const [pageNumber, setPageNumber] = useState(1)

  const [searchInput, setSearchInput] = useState('')

  const [search, setSearch] = useState('')

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const [form, setForm] = useState<AreaFormState>(EMPTY_FORM)

  const [editingArea, setEditingArea] = useState<Area | null>(null)

  const [showForm, setShowForm] = useState(false)

  const [formError, setFormError] = useState<string | null>(null)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [boundaryArea, setBoundaryArea] = useState<Area | null>(null)
  const [geoJson, setGeoJson] = useState('')

  const params: AreaListParams = {
    search: search || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    pageNumber,
    pageSize: PAGE_SIZE,
  }

  const areasQuery = useAreas(params)

  const parentAreasQuery = useAreas({
    isActive: true,
    pageNumber: 1,
    pageSize: 100,
  })

  const createMutation = useCreateArea()
  const updateMutation = useUpdateArea()
  const deleteMutation = useDeleteArea()
  const boundaryQuery = useAreaBoundary(boundaryArea?.id ?? null)
  const boundaryMutation = useUpdateAreaBoundary()

  const isSaving = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (areasQuery.data && pageNumber > 1 && areasQuery.data.items.length === 0) {
      setPageNumber(Math.max(1, areasQuery.data.totalPages))
    }
  }, [areasQuery.data, pageNumber])

  useEffect(() => {
    if (boundaryQuery.data) setGeoJson(boundaryQuery.data.geoJson ?? '')
  }, [boundaryQuery.data])

  function openCreateForm() {
    setEditingArea(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setSuccessMessage(null)
    setShowForm(true)
  }

  function openEditForm(area: Area) {
    setEditingArea(area)

    setForm({
      name: area.name,
      code: area.code ?? '',
      parentAreaId: area.parentAreaId?.toString() ?? '',
      isActive: area.isActive,
    })

    setFormError(null)
    setSuccessMessage(null)
    setShowForm(true)
  }

  function closeForm() {
    if (isSaving) {
      return
    }

    setShowForm(false)
    setEditingArea(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  function validateForm() {
    const name = form.name.trim()
    const code = form.code.trim().toUpperCase()

    if (!name) {
      return {
        error: 'Tên khu vực không được để trống.',
      }
    }

    if (name.length > 100) {
      return {
        error: 'Tên khu vực không được vượt quá 100 ký tự.',
      }
    }

    if (!code) {
      return {
        error: 'Mã khu vực không được để trống.',
      }
    }

    if (code.length > 20) {
      return {
        error: 'Mã khu vực không được vượt quá 20 ký tự.',
      }
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
      return {
        error: 'Mã khu vực chỉ được chứa chữ cái, chữ số, dấu gạch ngang và gạch dưới.',
      }
    }

    const parentAreaId = form.parentAreaId ? Number(form.parentAreaId) : null

    if (parentAreaId !== null && (!Number.isInteger(parentAreaId) || parentAreaId <= 0)) {
      return {
        error: 'Khu vực cha không hợp lệ.',
      }
    }

    if (editingArea && parentAreaId === editingArea.id) {
      return {
        error: 'Khu vực không thể là khu vực cha của chính nó.',
      }
    }

    return {
      error: null,
      value: {
        name,
        code,
        parentAreaId,
      },
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const validation = validateForm()

    if (validation.error || !validation.value) {
      setFormError(validation.error ?? 'Dữ liệu không hợp lệ.')
      return
    }

    try {
      if (editingArea) {
        await updateMutation.mutateAsync({
          id: editingArea.id,
          ...validation.value,
          isActive: form.isActive,
        })

        setSuccessMessage('Đã cập nhật khu vực.')
      } else {
        await createMutation.mutateAsync(validation.value)

        setSearchInput('')
        setSearch('')
        setStatusFilter('all')
        setPageNumber(1)

        setSuccessMessage('Đã tạo khu vực thành công.')
      }

      setShowForm(false)
      setEditingArea(null)
      setForm(EMPTY_FORM)
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          editingArea ? 'Không thể cập nhật khu vực.' : 'Không thể tạo khu vực.',
        ),
      )
    }
  }

  async function handleToggleActive(area: Area) {
    setFormError(null)
    setSuccessMessage(null)

    try {
      if (area.isActive) {
        await deleteMutation.mutateAsync(area.id)
      } else {
        await updateMutation.mutateAsync({
          id: area.id,
          name: area.name,
          code: area.code ?? '',
          parentAreaId: area.parentAreaId,
          isActive: true,
        })
      }

      setSuccessMessage(
        area.isActive ? 'Đã vô hiệu hóa khu vực.' : 'Đã kích hoạt khu vực.',
      )
    } catch (error) {
      setFormError(getErrorMessage(error, 'Không thể thay đổi trạng thái khu vực.'))
    }
  }

  const page = areasQuery.data

  const parentOptions =
    parentAreasQuery.data?.items.filter((area) => area.id !== editingArea?.id) ?? []

  return (
    <section className="resource-page flex flex-col gap-5">
      <div className="page-heading page-heading--split flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Quản lý khu vực
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý cây khu vực và trạng thái hoạt động của từng khu vực.
          </p>
        </div>

        <Button type="button" onClick={openCreateForm}>
          Thêm khu vực
        </Button>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      {formError && !showForm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {formError}
        </div>
      )}

      <Card className="p-5">
        <form
          className="flex flex-col gap-3 md:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            setPageNumber(1)
            setSearch(searchInput.trim())
          }}
        >
          <input
            value={searchInput}
            maxLength={100}
            placeholder="Tìm theo tên hoặc mã khu vực..."
            onChange={(event) => setSearchInput(event.target.value)}
            className="h-10 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')
              setPageNumber(1)
            }}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>

          <Button type="submit">Tìm kiếm</Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearchInput('')
              setSearch('')
              setStatusFilter('all')
              setPageNumber(1)
            }}
          >
            Đặt lại
          </Button>
        </form>
      </Card>

      {showForm && (
        <Card className="border-blue-200 p-6 dark:border-blue-900">
          <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            {editingArea ? `Cập nhật khu vực #${editingArea.id}` : 'Tạo khu vực'}
          </h2>

          <form className="mt-4 grid max-w-3xl gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="areaName" className="text-sm font-medium">
                  Tên khu vực
                </label>

                <input
                  id="areaName"
                  value={form.name}
                  maxLength={100}
                  disabled={isSaving}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                    setFormError(null)
                  }}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                />

                <p className="text-xs text-gray-500">{form.name.length}/100</p>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="areaCode" className="text-sm font-medium">
                  Mã khu vực
                </label>

                <input
                  id="areaCode"
                  value={form.code}
                  maxLength={20}
                  disabled={isSaving}
                  placeholder="VD: Q1, PHU_NHUAN"
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase(),
                    }))
                    setFormError(null)
                  }}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm uppercase dark:border-gray-700 dark:bg-gray-900"
                />

                <p className="text-xs text-gray-500">
                  {form.code.length}/20 · Chỉ chữ, số, dấu - và _
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="parentArea" className="text-sm font-medium">
                Khu vực cha
              </label>

              <select
                id="parentArea"
                value={form.parentAreaId}
                disabled={isSaving || parentAreasQuery.isPending}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    parentAreaId: event.target.value,
                  }))
                  setFormError(null)
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="">Không có khu vực cha</option>

                {parentOptions.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                    {area.code ? ` (${area.code})` : ''}
                  </option>
                ))}
              </select>

              {parentAreasQuery.isError && (
                <p className="text-xs text-red-600">
                  Không thể tải danh sách khu vực cha.
                </p>
              )}
            </div>

            {editingArea && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />
                Khu vực đang hoạt động
              </label>
            )}

            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={isSaving} disabled={isSaving}>
                {editingArea ? 'Lưu thay đổi' : 'Tạo khu vực'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                onClick={closeForm}
              >
                Hủy
              </Button>
            </div>
          </form>
        </Card>
      )}

      {areasQuery.isPending ? (
        <div className="flex min-h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : areasQuery.isError ? (
        <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium text-red-600">
            {getErrorMessage(areasQuery.error, 'Không thể tải danh sách khu vực.')}
          </p>

          <Button type="button" onClick={() => areasQuery.refetch()}>
            Thử lại
          </Button>
        </Card>
      ) : !page || page.items.length === 0 ? (
        <Card className="p-10 text-center">
          <h2 className="text-lg font-semibold">Chưa có khu vực phù hợp</h2>

          <p className="mt-2 text-sm text-gray-500">
            Tạo khu vực mới hoặc thay đổi bộ lọc.
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs tracking-wide text-gray-500 uppercase dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Tên</th>
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Khu vực cha</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Cập nhật</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {page.items.map((area) => (
                    <tr key={area.id} className="align-top">
                      <td className="px-4 py-3 font-medium">#{area.id}</td>

                      <td className="px-4 py-3 font-medium">{area.name}</td>

                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                        {area.code || '—'}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {area.parentAreaName || 'Khu vực gốc'}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={
                            area.isActive
                              ? 'inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800'
                              : 'inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700'
                          }
                        >
                          {area.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatDate(area.updatedAt ?? area.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={updateMutation.isPending}
                            onClick={() => openEditForm(area)}
                          >
                            Sửa
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setBoundaryArea(area)
                              setGeoJson('')
                            }}
                          >
                            GeoJSON
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={updateMutation.isPending}
                            onClick={() => void handleToggleActive(area)}
                          >
                            {area.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            <p>
              Tổng cộng {page.totalItems} khu vực · Trang {page.pageNumber}/
              {Math.max(1, page.totalPages)}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pageNumber <= 1 || areasQuery.isFetching}
                onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
              >
                Trang trước
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pageNumber >= page.totalPages || areasQuery.isFetching}
                onClick={() => setPageNumber((current) => current + 1)}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal
        open={Boolean(boundaryArea)}
        title={boundaryArea ? `Ranh giới ${boundaryArea.name}` : 'Ranh giới khu vực'}
        description="Nhập GeoJSON Polygon hoặc MultiPolygon. Để trống để xóa ranh giới."
        className="max-w-3xl"
        onClose={() => !boundaryMutation.isPending && setBoundaryArea(null)}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setBoundaryArea(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              loading={boundaryMutation.isPending}
              onClick={async () => {
                if (!boundaryArea) return
                const normalized = geoJson.trim()
                if (normalized) {
                  try {
                    JSON.parse(normalized)
                  } catch {
                    setFormError('GeoJSON không phải JSON hợp lệ.')
                    return
                  }
                }
                await boundaryMutation.mutateAsync({
                  areaId: boundaryArea.id,
                  geoJson: normalized || null,
                })
                setBoundaryArea(null)
                setSuccessMessage(
                  normalized
                    ? 'Đã cập nhật ranh giới khu vực.'
                    : 'Đã xóa ranh giới khu vực.',
                )
              }}
            >
              Lưu ranh giới
            </Button>
          </>
        }
      >
        {boundaryQuery.isPending ? (
          <Spinner />
        ) : (
          <textarea
            value={geoJson}
            rows={16}
            spellCheck={false}
            placeholder='{"type":"Polygon","coordinates":[...]}'
            onChange={(event) => setGeoJson(event.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 font-mono text-xs dark:border-gray-700 dark:bg-gray-900"
          />
        )}
      </Modal>
    </section>
  )
}

import { type FormEvent, useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ApiError } from '@/lib/api/http'

import { useSlaConfigs, useUpdateSlaConfig } from './sla-configs.queries'
import type { GetSlaConfigsParams, ReportPriority, SlaConfig } from './sla-configs.types'

const PAGE_SIZE = 10

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
    return 'Chưa cập nhật'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function getPriorityLabel(priority: ReportPriority): string {
  switch (priority) {
    case 'High':
      return 'Cao'

    case 'Medium':
      return 'Trung bình'

    case 'Low':
      return 'Thấp'
  }
}

export default function SlaConfigsPage() {
  const [pageNumber, setPageNumber] = useState(1)

  const [searchInput, setSearchInput] = useState('')

  const [search, setSearch] = useState('')

  const [priority, setPriority] = useState<ReportPriority | ''>('')

  const [editingConfig, setEditingConfig] = useState<SlaConfig | null>(null)

  const [durationHours, setDurationHours] = useState('')

  const [formError, setFormError] = useState<string | null>(null)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const params: GetSlaConfigsParams = {
    search: search || undefined,
    priority: priority || undefined,
    pageNumber,
    pageSize: PAGE_SIZE,
  }

  const configsQuery = useSlaConfigs(params)

  const updateMutation = useUpdateSlaConfig()

  useEffect(() => {
    if (configsQuery.data && pageNumber > 1 && configsQuery.data.items.length === 0) {
      setPageNumber(Math.max(1, configsQuery.data.totalPages))
    }
  }, [configsQuery.data, pageNumber])

  function openEditForm(config: SlaConfig) {
    setEditingConfig(config)
    setDurationHours(String(config.durationHours))
    setFormError(null)
    setSuccessMessage(null)
  }

  function closeEditForm() {
    if (updateMutation.isPending) {
      return
    }

    setEditingConfig(null)
    setDurationHours('')
    setFormError(null)
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    if (!editingConfig) {
      return
    }

    const normalizedDuration = Number(durationHours)

    if (
      !Number.isInteger(normalizedDuration) ||
      normalizedDuration < 1 ||
      normalizedDuration > 8760
    ) {
      setFormError('Thời gian SLA phải là số nguyên từ 1 đến 8760 giờ.')

      return
    }

    try {
      await updateMutation.mutateAsync({
        id: editingConfig.id,
        durationHours: normalizedDuration,
      })

      setSuccessMessage(
        `Đã cập nhật SLA cho ${editingConfig.categoryName} – ${getPriorityLabel(editingConfig.priority)}.`,
      )

      setEditingConfig(null)
      setDurationHours('')
    } catch (error) {
      setFormError(getErrorMessage(error, 'Không thể cập nhật cấu hình SLA.'))
    }
  }

  const page = configsQuery.data

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Quản lý cấu hình SLA
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Xem và cập nhật thời gian xử lý theo Category và mức ưu tiên.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {formError && !editingConfig && (
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
            placeholder="Tìm theo tên Category..."
            onChange={(event) => setSearchInput(event.target.value)}
            className="h-10 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />

          <select
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value as ReportPriority | '')
              setPageNumber(1)
            }}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Tất cả mức ưu tiên</option>

            <option value="Low">Thấp</option>

            <option value="Medium">Trung bình</option>

            <option value="High">Cao</option>
          </select>

          <Button type="submit">Tìm kiếm</Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearchInput('')
              setSearch('')
              setPriority('')
              setPageNumber(1)
            }}
          >
            Đặt lại
          </Button>
        </form>
      </Card>

      {editingConfig && (
        <Card className="border-blue-200 p-6 dark:border-blue-900">
          <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            Cập nhật cấu hình SLA
          </h2>

          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-gray-500">Category</p>

              <p className="mt-1 font-medium">{editingConfig.categoryName}</p>
            </div>

            <div>
              <p className="text-gray-500">Mức ưu tiên</p>

              <p className="mt-1 font-medium">
                {getPriorityLabel(editingConfig.priority)}
              </p>
            </div>
          </div>

          <form className="mt-4 flex max-w-xl flex-col gap-4" onSubmit={handleUpdate}>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="durationHours"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Thời gian SLA (giờ)
              </label>

              <input
                id="durationHours"
                type="number"
                min={1}
                max={8760}
                step={1}
                value={durationHours}
                disabled={updateMutation.isPending}
                onChange={(event) => {
                  setDurationHours(event.target.value)
                  setFormError(null)
                  setSuccessMessage(null)
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />

              <p className="text-xs text-gray-500">
                Backend chấp nhận từ 1 đến 8760 giờ.
              </p>
            </div>

            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                loading={updateMutation.isPending}
                disabled={updateMutation.isPending || !durationHours}
              >
                Lưu thay đổi
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={updateMutation.isPending}
                onClick={closeEditForm}
              >
                Hủy
              </Button>
            </div>
          </form>
        </Card>
      )}

      {configsQuery.isPending ? (
        <div className="flex min-h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : configsQuery.isError ? (
        <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium text-red-600">
            {getErrorMessage(configsQuery.error, 'Không thể tải cấu hình SLA.')}
          </p>

          <Button type="button" onClick={() => configsQuery.refetch()}>
            Thử lại
          </Button>
        </Card>
      ) : !page || page.items.length === 0 ? (
        <Card className="p-10 text-center">
          <h2 className="text-lg font-semibold">Không có cấu hình SLA phù hợp</h2>

          <p className="mt-2 text-sm text-gray-500">
            Thay đổi từ khóa hoặc bộ lọc để tìm kiếm lại.
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

                    <th className="px-4 py-3">Category</th>

                    <th className="px-4 py-3">Mức ưu tiên</th>

                    <th className="px-4 py-3">Thời gian SLA</th>

                    <th className="px-4 py-3">Cập nhật gần nhất</th>

                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {page.items.map((config) => (
                    <tr key={config.id}>
                      <td className="px-4 py-3 font-medium">#{config.id}</td>

                      <td className="px-4 py-3">{config.categoryName}</td>

                      <td className="px-4 py-3">{getPriorityLabel(config.priority)}</td>

                      <td className="px-4 py-3">
                        <strong>{config.durationHours}</strong> giờ
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatDate(config.updatedAt ?? config.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={updateMutation.isPending}
                          onClick={() => openEditForm(config)}
                        >
                          Sửa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            <p>
              Tổng cộng {page.totalItems} cấu hình · Trang {page.pageNumber}/
              {Math.max(1, page.totalPages)}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pageNumber <= 1 || configsQuery.isFetching}
                onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
              >
                Trang trước
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pageNumber >= page.totalPages || configsQuery.isFetching}
                onClick={() => setPageNumber((current) => current + 1)}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

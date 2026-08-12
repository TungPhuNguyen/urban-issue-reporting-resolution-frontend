import { type FormEvent, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ApiError } from '@/lib/api/http'
import { parseApiDateTime } from '@/lib/utils/date-time'

import { useAuditLogDetail, useAuditLogs } from './audit-logs.queries'

const PAGE_SIZE = 15

interface Filters {
  action: string
  entityType: string
  entityId: string
  fromDate: string
  toDate: string
}

const EMPTY_FILTERS: Filters = {
  action: '',
  entityType: '',
  entityId: '',
  fromDate: '',
  toDate: '',
}

function formatDate(value: string) {
  const date = parseApiDateTime(value)

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(date)
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message
  }

  return 'Không thể tải nhật ký hệ thống.'
}

function prettyDetail(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

export default function AuditLogsPage() {
  const [pageNumber, setPageNumber] = useState(1)
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const query = useAuditLogs({
    pageNumber,
    pageSize: PAGE_SIZE,
    action: filters.action || undefined,
    entityType: filters.entityType || undefined,
    entityId: filters.entityId || undefined,
    createdFrom: filters.fromDate ? `${filters.fromDate}T00:00:00` : undefined,
    createdTo: filters.toDate ? `${filters.toDate}T23:59:59` : undefined,
  })
  const detailQuery = useAuditLogDetail(selectedId)

  function submit(event: FormEvent) {
    event.preventDefault()
    setPageNumber(1)
    setFilters({
      action: draft.action.trim(),
      entityType: draft.entityType.trim(),
      entityId: draft.entityId.trim(),
      fromDate: draft.fromDate,
      toDate: draft.toDate,
    })
  }

  const page = query.data
  const totalPages = Math.max(page?.totalPages ?? 0, 1)

  return (
    <section className="audit-page flex flex-col gap-5">
      <div className="page-heading page-heading--split">
        <div>
          <Badge variant="danger">Kiểm soát hệ thống</Badge>
          <h1>Nhật ký hoạt động</h1>
          <p>Tra cứu thao tác quản trị và thay đổi nghiệp vụ quan trọng.</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          loading={query.isFetching}
          onClick={() => void query.refetch()}
        >
          Làm mới
        </Button>
      </div>

      <Card className="panel filter-bar filter-bar--wrap">
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" onSubmit={submit}>
          <input
            value={draft.action}
            placeholder="Action"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                action: event.target.value,
              }))
            }
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <input
            value={draft.entityType}
            placeholder="Entity type"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                entityType: event.target.value,
              }))
            }
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <input
            value={draft.entityId}
            placeholder="Entity ID"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                entityId: event.target.value,
              }))
            }
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <input
            type="date"
            aria-label="Từ ngày"
            value={draft.fromDate}
            max={draft.toDate || undefined}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                fromDate: event.target.value,
              }))
            }
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <input
            type="date"
            aria-label="Đến ngày"
            value={draft.toDate}
            min={draft.fromDate || undefined}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                toDate: event.target.value,
              }))
            }
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <div className="flex gap-2 xl:col-span-5">
            <Button type="submit">Áp dụng</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDraft(EMPTY_FILTERS)
                setFilters(EMPTY_FILTERS)
                setPageNumber(1)
              }}
            >
              Đặt lại
            </Button>
          </div>
        </form>
      </Card>

      {query.isPending ? (
        <div className="flex min-h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : query.isError ? (
        <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium text-red-600">{errorMessage(query.error)}</p>
          <Button type="button" onClick={() => void query.refetch()}>
            Thử lại
          </Button>
        </Card>
      ) : !page || page.items.length === 0 ? (
        <Card className="p-10 text-center">Không có nhật ký phù hợp.</Card>
      ) : (
        <>
          <Card className="panel table-panel overflow-hidden">
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Người thực hiện</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Đối tượng</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {page.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <p>{item.userName ?? 'Hệ thống'}</p>
                        <p className="text-xs text-gray-500">{item.userEmail}</p>
                      </td>
                      <td className="px-4 py-3 font-medium">{item.action}</td>
                      <td className="px-4 py-3">
                        <p>{item.entityType}</p>
                        <p className="font-mono text-xs text-gray-500">{item.entityId}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedId(item.id)}
                        >
                          Chi tiết
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
              Tổng cộng {page.totalItems} nhật ký · Trang {page.pageNumber}/{totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pageNumber <= 1 || query.isFetching}
                onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
              >
                Trang trước
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pageNumber >= totalPages || query.isFetching}
                onClick={() => setPageNumber((current) => current + 1)}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </>
      )}

      {selectedId !== null && (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Chi tiết nhật ký #{selectedId}</h2>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setSelectedId(null)}
            >
              Đóng
            </Button>
          </div>
          {detailQuery.isPending ? (
            <div className="mt-4">
              <Spinner />
            </div>
          ) : detailQuery.isError ? (
            <p className="mt-4 text-sm text-red-600">{errorMessage(detailQuery.error)}</p>
          ) : detailQuery.data ? (
            <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-950 p-4 text-xs whitespace-pre-wrap text-gray-100">
              {prettyDetail(detailQuery.data.detail)}
            </pre>
          ) : null}
        </Card>
      )}
    </section>
  )
}

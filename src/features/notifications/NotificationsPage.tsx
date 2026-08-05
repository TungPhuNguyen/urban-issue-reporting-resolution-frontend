import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useAuthStore } from '@/features/auth/auth.store'
import { ApiError } from '@/lib/api/http'

import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationCount,
} from './notifications.queries'

import type { NotificationItem, NotificationType } from './notifications.types'

const PAGE_SIZE = 20

type ReadFilter = 'all' | 'unread' | 'read'

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    ReportAssigned: 'Phân công báo cáo',
    ReportStatusChanged: 'Thay đổi trạng thái',
    ReportResolved: 'Báo cáo đã xử lý',
    ReportClosed: 'Báo cáo đã đóng',
    ReportRejected: 'Báo cáo bị từ chối',
    ReportReopened: 'Báo cáo được mở lại',
    ReportReassigned: 'Phân công lại',
    ComplaintSubmitted: 'Khiếu nại mới',
    SLAWarning: 'Cảnh báo SLA',
    SLABreached: 'Vi phạm SLA',
    Escalated: 'Cảnh báo quá hạn',
  }

  return labels[type] ?? type
}

function getReportPath(
  role: 'Citizen' | 'Staff' | 'Admin' | undefined,
  reportId: string,
): string {
  if (role === 'Admin') {
    return `/admin/reports/${reportId}`
  }

  if (role === 'Staff') {
    return `/staff/reports/${reportId}`
  }

  return `/citizen/reports/${reportId}`
}

export default function NotificationsPage() {
  const role = useAuthStore((state) => state.user?.role)

  const [pageNumber, setPageNumber] = useState(1)
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [message, setMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const notificationsQuery = useNotifications({
    isRead: readFilter === 'all' ? undefined : readFilter === 'read',
    pageNumber,
    pageSize: PAGE_SIZE,
  })

  const unreadCountQuery = useUnreadNotificationCount()
  const markReadMutation = useMarkNotificationAsRead()
  const markAllMutation = useMarkAllNotificationsAsRead()

  const page = notificationsQuery.data
  const isMutating = markReadMutation.isPending || markAllMutation.isPending

  useEffect(() => {
    if (page && pageNumber > 1 && page.items.length === 0) {
      setPageNumber(Math.max(1, page.totalPages))
    }
  }, [page, pageNumber])

  async function handleMarkRead(notification: NotificationItem) {
    if (notification.isRead) {
      return
    }

    setMessage(null)
    setActionError(null)

    try {
      await markReadMutation.mutateAsync(notification.id)
      setMessage('Đã đánh dấu thông báo là đã đọc.')
    } catch (error) {
      setActionError(getErrorMessage(error, 'Không thể đánh dấu thông báo là đã đọc.'))
    }
  }

  async function handleMarkAllRead() {
    setMessage(null)
    setActionError(null)

    try {
      const result = await markAllMutation.mutateAsync()

      setMessage(
        result.updatedCount > 0
          ? `Đã đánh dấu ${result.updatedCount} thông báo là đã đọc.`
          : 'Không còn thông báo chưa đọc.',
      )
    } catch (error) {
      setActionError(
        getErrorMessage(error, 'Không thể đánh dấu tất cả thông báo là đã đọc.'),
      )
    }
  }

  function refresh() {
    setMessage(null)
    setActionError(null)
    void notificationsQuery.refetch()
    void unreadCountQuery.refetch()
  }

  return (
    <section className="notifications-page flex flex-col gap-5">
      <div className="page-heading page-heading--split flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Thông báo
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi các thay đổi liên quan đến báo cáo của bạn.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={notificationsQuery.isFetching}
            onClick={refresh}
          >
            Làm mới
          </Button>
          <Button
            type="button"
            disabled={isMutating || (unreadCountQuery.data ?? 0) === 0}
            loading={markAllMutation.isPending}
            onClick={() => void handleMarkAllRead()}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Chưa đọc</p>
          <p className="mt-1 text-2xl font-semibold">{unreadCountQuery.data ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Tổng trong bộ lọc</p>
          <p className="mt-1 text-2xl font-semibold">{page?.totalItems ?? 0}</p>
        </Card>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {message}
        </div>
      )}

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <Card className="p-4">
        <label className="flex max-w-xs flex-col gap-1 text-sm font-medium">
          Trạng thái đọc
          <select
            value={readFilter}
            onChange={(event) => {
              setReadFilter(event.target.value as ReadFilter)
              setPageNumber(1)
            }}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="all">Tất cả</option>
            <option value="unread">Chưa đọc</option>
            <option value="read">Đã đọc</option>
          </select>
        </label>
      </Card>

      {notificationsQuery.isPending ? (
        <div className="flex min-h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : notificationsQuery.isError ? (
        <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium text-red-600">
            {getErrorMessage(notificationsQuery.error, 'Không thể tải thông báo.')}
          </p>
          <Button type="button" onClick={() => notificationsQuery.refetch()}>
            Thử lại
          </Button>
        </Card>
      ) : !page || page.items.length === 0 ? (
        <EmptyState
          title="Chưa có thông báo"
          description="Các thông báo mới sẽ xuất hiện tại đây."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {page.items.map((notification) => (
              <Card
                key={notification.id}
                className={
                  notification.isRead
                    ? 'p-5'
                    : 'border-blue-300 bg-blue-50/60 p-5 dark:border-blue-800 dark:bg-blue-950/20'
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!notification.isRead && (
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 rounded-full bg-blue-600"
                        />
                      )}
                      <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                        {notification.title}
                      </h2>
                      <Badge variant="default">{getTypeLabel(notification.type)}</Badge>
                    </div>

                    <p className="mt-2 text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </p>

                    <p className="mt-3 text-xs text-gray-500">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {notification.reportId && (
                      <Link
                        to={getReportPath(role, notification.reportId)}
                        onClick={() => void handleMarkRead(notification)}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-300 px-3 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        Mở báo cáo
                      </Link>
                    )}

                    {!notification.isRead && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isMutating}
                        loading={
                          markReadMutation.isPending &&
                          markReadMutation.variables === notification.id
                        }
                        onClick={() => void handleMarkRead(notification)}
                      >
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            <p>
              Tổng cộng {page.totalItems} thông báo · Trang {page.pageNumber}/
              {Math.max(1, page.totalPages)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pageNumber <= 1 || notificationsQuery.isFetching}
                onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
              >
                Trang trước
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pageNumber >= page.totalPages || notificationsQuery.isFetching}
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

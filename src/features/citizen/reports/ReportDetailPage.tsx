import {
  useEffect,
  useState,
} from 'react'
import {
  Link,
  useLocation,
  useParams,
} from 'react-router-dom'

import { env } from '@/config/env'

import { citizenReportApi } from './citizen-report.api'
import type {
  CitizenReportDetail,
  ReportStatus,
} from './citizen-report.types'

const statusLabels: Record<ReportStatus, string> = {
  New: 'Mới tạo',
  Assigned: 'Đã phân công',
  Accepted: 'Đã tiếp nhận',
  InProgress: 'Đang xử lý',
  Resolved: 'Đã xử lý',
  Closed: 'Đã đóng',
  Rejected: 'Bị từ chối',
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Chưa có'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function resolveImageUrl(imageUrl: string): string {
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl
  }

  try {
    const backendOrigin = new URL(
      env.apiBaseUrl,
    ).origin

    return `${backendOrigin}${
      imageUrl.startsWith('/') ? '' : '/'
    }${imageUrl}`
  } catch {
    return imageUrl
  }
}

export default function ReportDetailPage() {
  const { reportId } = useParams<{
    reportId: string
  }>()

  const location = useLocation()

  const created = Boolean(
    (
      location.state as
        | {
            created?: boolean
          }
        | null
    )?.created,
  )

  const [report, setReport] =
    useState<CitizenReportDetail | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadReport() {
      if (!reportId) {
        setError('ID báo cáo không hợp lệ.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const result =
          await citizenReportApi.getReportDetail(reportId)

        if (!cancelled) {
          setReport(result)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Không tải được thông tin báo cáo.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadReport()

    return () => {
      cancelled = true
    }
  }, [reportId])

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
        Đang tải thông tin báo cáo...
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="font-semibold">
            Không tải được báo cáo
          </h1>

          <p className="mt-2 text-sm">
            {error || 'Không tìm thấy báo cáo.'}
          </p>

          <Link
            to="/citizen/reports"
            className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            Quay lại
          </Link>
        </div>
      </div>
    )
  }

  const isManualAssignment =
    report.requiresManualAssignment

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết phản ánh
          </h1>

          <p className="mt-1 break-all text-sm text-gray-500">
            Mã báo cáo: {report.id}
          </p>
        </div>

        <Link
          to="/citizen/reports"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Quay lại danh sách
        </Link>
      </div>

      {created && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
          <p className="font-semibold">
            Tạo phản ánh thành công
          </p>

          <p className="mt-1 text-sm">
            Hệ thống đã lưu phản ánh của bạn.
          </p>
        </div>
      )}

      {isManualAssignment ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="font-bold text-amber-800">
            Chờ Admin phân công
          </h2>

          <p className="mt-2 text-sm text-amber-700">
            Hiện chưa tìm thấy quy tắc phân công phù hợp
            với loại sự cố và khu vực đã chọn. Báo cáo đang
            chờ Admin phân công thủ công.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
          <h2 className="font-bold text-emerald-800">
            Đã tự động phân công
          </h2>

          <p className="mt-2 text-sm text-emerald-700">
            Báo cáo đã được hệ thống tự động chuyển đến{' '}
            <strong>
              {report.departmentName ??
                'phòng ban phụ trách'}
            </strong>
            .
          </p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {statusLabels[report.status] ??
              report.status}
          </span>

          {report.priority && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              Mức độ: {report.priority}
            </span>
          )}
        </div>

        <dl className="grid gap-5 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Loại sự cố
            </dt>

            <dd className="mt-1 text-gray-900">
              {report.categoryName}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">
              Khu vực
            </dt>

            <dd className="mt-1 text-gray-900">
              {report.areaName}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">
              Phòng ban
            </dt>

            <dd className="mt-1 text-gray-900">
              {report.departmentName ??
                'Chưa được phân công'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">
              Ngày tạo
            </dt>

            <dd className="mt-1 text-gray-900">
              {formatDate(report.createdAt)}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">
              Địa chỉ
            </dt>

            <dd className="mt-1 text-gray-900">
              {report.addressText || 'Không có'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">
              Tọa độ
            </dt>

            <dd className="mt-1 text-gray-900">
              {report.latitude}, {report.longitude}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-gray-200 pt-5">
          <h2 className="text-sm font-medium text-gray-500">
            Nội dung phản ánh
          </h2>

          <p className="mt-2 whitespace-pre-wrap text-gray-900">
            {report.description}
          </p>
        </div>
      </div>

      {report.imageUrls.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Ảnh sự cố
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {report.imageUrls.map(
              (imageUrl, index) => (
                <img
                  key={`${imageUrl}-${index}`}
                  src={resolveImageUrl(imageUrl)}
                  alt={`Ảnh sự cố ${index + 1}`}
                  className="h-52 w-full rounded-lg border border-gray-200 object-cover"
                />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}
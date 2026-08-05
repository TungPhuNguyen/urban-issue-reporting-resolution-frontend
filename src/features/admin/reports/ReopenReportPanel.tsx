import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getStatusLabel } from '@/components/ui/report-labels'
import { ApiError } from '@/lib/api/http'

import { useDismissComplaint, useReopenReport } from './admin-reports.queries'
import type { AdminReportDetail } from './admin-reports.types'

interface Props {
  report: AdminReportDetail
  onSuccess: () => void
}

type Decision = 'reopen' | 'dismiss'

function message(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message
  }

  return 'Không thể xử lý khiếu nại.'
}

export default function ReopenReportPanel({ report, onSuccess }: Props) {
  const [reason, setReason] = useState('')
  const [decision, setDecision] = useState<Decision | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const reopenMutation = useReopenReport()
  const dismissMutation = useDismissComplaint()
  const isPending = reopenMutation.isPending || dismissMutation.isPending
  const hasPendingComplaint =
    report.status === 'Resolved' && report.complaintSubmittedAt !== null

  async function submit() {
    if (!decision) {
      return
    }

    const value = reason.trim()

    if (value.length < 10 || value.length > 2000) {
      setError('Lý do quyết định phải từ 10 đến 2000 ký tự.')
      return
    }

    setError(null)
    setSuccess(null)

    try {
      if (decision === 'reopen') {
        await reopenMutation.mutateAsync({
          reportId: report.id,
          reason: value,
        })
        setSuccess('Đã chấp nhận khiếu nại và mở lại báo cáo.')
      } else {
        await dismissMutation.mutateAsync({
          reportId: report.id,
          reason: value,
        })
        setSuccess('Đã không chấp nhận khiếu nại và đóng báo cáo.')
      }

      setReason('')
      setDecision(null)
      onSuccess()
    } catch (caughtError) {
      setDecision(null)
      setError(message(caughtError))
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Xử lý khiếu nại</h2>
      <p className="mt-1 text-sm text-gray-500">
        Admin ghi nhận lý do quyết định, sau đó mở lại hoặc không chấp nhận và đóng báo
        cáo.
      </p>

      {report.complaintReason && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">Nội dung của Citizen</p>
          <p className="mt-2 text-sm whitespace-pre-wrap text-blue-800">
            {report.complaintReason}
          </p>
        </div>
      )}

      {!hasPendingComplaint ? (
        <p className="mt-4 text-sm text-gray-500">Không có khiếu nại đang chờ xử lý.</p>
      ) : (
        <div className="mt-4 flex max-w-2xl flex-col gap-3">
          <label htmlFor="complaintDecisionReason" className="text-sm font-medium">
            Lý do quyết định của Admin
          </label>
          <textarea
            id="complaintDecisionReason"
            value={reason}
            rows={4}
            maxLength={2000}
            disabled={isPending}
            placeholder="Nhập lý do cụ thể, tối thiểu 10 ký tự."
            onChange={(event) => {
              setReason(event.target.value)
              setError(null)
              setSuccess(null)
              setDecision(null)
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <p className="text-right text-xs text-gray-500">{reason.length}/2000</p>

          {decision === null ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={isPending || reason.trim().length < 10}
                onClick={() => setDecision('reopen')}
              >
                Chấp nhận và mở lại
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isPending || reason.trim().length < 10}
                onClick={() => setDecision('dismiss')}
              >
                Không chấp nhận
              </Button>
            </div>
          ) : (
            <div
              className={`rounded-lg border p-4 ${
                decision === 'reopen'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-amber-200 bg-amber-50'
              }`}
            >
              <p className="text-sm font-medium">
                {decision === 'reopen'
                  ? 'Xác nhận mở lại báo cáo?'
                  : 'Xác nhận không chấp nhận khiếu nại?'}
              </p>
              <p className="mt-1 text-sm">
                {decision === 'reopen'
                  ? `Báo cáo sẽ trở về trạng thái ${getStatusLabel('InProgress')} và tiếp tục xử lý.`
                  : `Khiếu nại sẽ được xử lý và báo cáo chuyển sang trạng thái ${getStatusLabel('Closed')}.`}
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  loading={isPending}
                  disabled={isPending}
                  onClick={() => void submit()}
                >
                  Xác nhận
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => setDecision(null)}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {success}
        </div>
      )}
    </Card>
  )
}

import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { ApiError } from '@/lib/api/http'
import { parseApiDateTime } from '@/lib/utils/date-time'

import {
  useAddReportComment,
  useDeleteReportComment,
  useReportComments,
} from './citizen-report.queries'

function formatDate(value: string) {
  const date = parseApiDateTime(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN')
}

export function ReportComments({ reportId }: { reportId: string }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const commentsQuery = useReportComments(reportId)
  const addMutation = useAddReportComment(reportId)
  const deleteMutation = useDeleteReportComment(reportId)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = content.trim()

    if (!normalized || normalized.length > 1000) {
      setError('Bình luận phải có từ 1 đến 1000 ký tự.')
      return
    }

    setError(null)
    try {
      await addMutation.mutateAsync(normalized)
      setContent('')
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không thể gửi bình luận.',
      )
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Trao đổi về báo cáo</h2>
      <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
        <textarea
          value={content}
          rows={3}
          maxLength={1000}
          disabled={addMutation.isPending}
          placeholder="Nhập nội dung bình luận..."
          onChange={(event) => {
            setContent(event.target.value)
            setError(null)
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-gray-500">{content.length}/1000</span>
          <Button type="submit" size="sm" loading={addMutation.isPending}>
            Gửi bình luận
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
        {commentsQuery.isPending ? (
          <Spinner label="Đang tải bình luận..." />
        ) : commentsQuery.isError ? (
          <div className="text-sm text-red-600">
            Không thể tải bình luận.{' '}
            <button className="underline" onClick={() => commentsQuery.refetch()}>
              Thử lại
            </button>
          </div>
        ) : !commentsQuery.data?.items.length ? (
          <EmptyState
            title="Chưa có bình luận"
            description="Hãy bắt đầu cuộc trao đổi về báo cáo này."
          />
        ) : (
          <ul className="space-y-3">
            {commentsQuery.data.items.map((comment) => (
              <li key={comment.id} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{comment.authorName}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  {comment.isMine && (
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      loading={
                        deleteMutation.isPending &&
                        deleteMutation.variables === comment.id
                      }
                      onClick={() => void deleteMutation.mutateAsync(comment.id)}
                    >
                      Xóa
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">{comment.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}

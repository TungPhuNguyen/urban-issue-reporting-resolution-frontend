import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ApiError } from '@/lib/api/http'

import { citizenReportApi } from './citizen-report.api'

export default function ReportLookupPage() {
  const navigate = useNavigate()
  const [reportCode, setReportCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = reportCode.trim().toUpperCase()
    if (!normalized) {
      setError('Vui lòng nhập mã báo cáo.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const report = await citizenReportApi.getReportByCode(normalized)
      navigate(`/citizen/reports/${report.id}`)
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không tìm thấy báo cáo.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Tra cứu báo cáo của tôi</h1>
      <p className="mt-1 text-sm text-gray-500">
        Nhập mã được cấp khi gửi phản ánh, ví dụ UI-2026-000001.
      </p>
      <Card className="mt-6 p-6">
        <form className="flex flex-col gap-4 sm:flex-row" onSubmit={handleSubmit}>
          <input
            value={reportCode}
            maxLength={50}
            placeholder="Nhập mã báo cáo"
            onChange={(event) => {
              setReportCode(event.target.value)
              setError(null)
            }}
            className="h-11 flex-1 rounded-lg border border-gray-300 bg-white px-3 uppercase dark:border-gray-700 dark:bg-gray-900"
          />
          <Button type="submit" loading={isLoading}>
            Tra cứu
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </Card>
    </section>
  )
}

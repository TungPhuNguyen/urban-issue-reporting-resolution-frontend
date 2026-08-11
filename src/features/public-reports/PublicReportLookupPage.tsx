import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ApiError } from '@/lib/api/http'

import { publicReportsApi } from './public-reports.api'

export default function PublicReportLookupPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = code.trim().toUpperCase()
    if (!normalized) {
      setError('Vui lòng nhập mã báo cáo.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const report = await publicReportsApi.getByCode(normalized)
      navigate(`/reports/${report.id}`)
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không tìm thấy báo cáo.',
      )
    } finally {
      setLoading(false)
    }
  }
  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-bold">Tra cứu phản ánh</h1>
      <p className="mt-2 text-gray-600">
        Nhập mã báo cáo để xem trạng thái xử lý công khai.
      </p>
      <Card className="mt-6 p-6">
        <form className="flex gap-3" onSubmit={submit}>
          <input
            value={code}
            maxLength={50}
            onChange={(e) => setCode(e.target.value)}
            placeholder="UI-100000"
            className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 px-3 uppercase"
          />
          <Button type="submit" loading={loading}>
            Tra cứu
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </Card>
    </section>
  )
}

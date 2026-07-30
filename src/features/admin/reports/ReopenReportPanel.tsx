import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ApiError } from '@/lib/api/http'
import { useReopenReport } from './admin-reports.queries'
import type { AdminReportDetail } from './admin-reports.types'

interface Props { report: AdminReportDetail; onSuccess: () => void }
function message(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) return error.message
  return 'Không thể mở lại báo cáo.'
}
export default function ReopenReportPanel({ report, onSuccess }: Props) {
  const [reason,setReason]=useState('')
  const [confirming,setConfirming]=useState(false)
  const [error,setError]=useState<string|null>(null)
  const [success,setSuccess]=useState<string|null>(null)
  const mutation=useReopenReport()
  const canReopen=report.status==='Resolved' && report.complaintSubmittedAt!==null && report.assignedStaffId!==null && report.appliedSlaHours!==null && report.appliedSlaHours>0
  async function submit(){
    const value=reason.trim()
    if(value.length<10 || value.length>2000){setError('Lý do mở lại phải từ 10 đến 2000 ký tự.');return}
    setError(null);setSuccess(null)
    try{await mutation.mutateAsync({reportId:report.id,reason:value});setReason('');setConfirming(false);setSuccess('Đã chấp nhận yêu cầu và mở lại báo cáo.');onSuccess()}
    catch(e){setConfirming(false);setError(message(e))}
  }
  return <Card className="p-6">
    <h2 className="text-lg font-semibold">Xử lý yêu cầu mở lại</h2>
    {report.complaintReason && <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4"><p className="text-sm font-medium text-blue-900">Lý do của Citizen</p><p className="mt-2 whitespace-pre-wrap text-sm text-blue-800">{report.complaintReason}</p></div>}
    {!report.complaintSubmittedAt ? <p className="mt-4 text-sm text-gray-500">Không có yêu cầu mở lại đang chờ xử lý.</p> : !canReopen ? <p className="mt-4 text-sm text-amber-700">Báo cáo chưa đáp ứng điều kiện mở lại của backend.</p> : <div className="mt-4 flex max-w-2xl flex-col gap-3">
      <label htmlFor="reopenReason" className="text-sm font-medium">Lý do Admin chấp nhận mở lại</label>
      <textarea id="reopenReason" value={reason} rows={4} maxLength={2000} disabled={mutation.isPending} onChange={e=>{setReason(e.target.value);setError(null);setSuccess(null)}} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
      <p className="text-right text-xs text-gray-500">{reason.length}/2000</p>
      {!confirming ? <div><Button type="button" disabled={mutation.isPending||reason.trim().length<10} onClick={()=>setConfirming(true)}>Chấp nhận và mở lại</Button></div> : <div className="rounded-lg border border-blue-200 bg-blue-50 p-4"><p className="text-sm font-medium text-blue-900">Xác nhận mở lại báo cáo?</p><p className="mt-1 text-sm text-blue-800">Báo cáo sẽ trở về InProgress và bắt đầu chu kỳ SLA mới.</p><div className="mt-4 flex gap-2"><Button type="button" loading={mutation.isPending} disabled={mutation.isPending} onClick={()=>void submit()}>Xác nhận</Button><Button type="button" variant="secondary" disabled={mutation.isPending} onClick={()=>setConfirming(false)}>Hủy</Button></div></div>}
    </div>}
    {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {success && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</div>}
  </Card>
}

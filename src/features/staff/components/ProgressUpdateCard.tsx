import { useRef, useState } from 'react'

import { Card } from '@/components/ui/Card'

import {
  useAddProgressNote,
  useResolveReport,
  useUploadProgressImages,
} from '../staff.queries'

interface ProgressUpdateCardProps {
  reportId: string
}

export function ProgressUpdateCard({ reportId }: ProgressUpdateCardProps) {
  const addProgressNote = useAddProgressNote(reportId)
  const uploadProgressImages = useUploadProgressImages(reportId)
  const resolveReport = useResolveReport(reportId)

  const [progressNote, setProgressNote] = useState('')
  const [progressImages, setProgressImages] = useState<File[]>([])
  const [resolveNote, setResolveNote] = useState('')
  const [resolveImages, setResolveImages] = useState<File[]>([])

  const progressImageInputRef = useRef<HTMLInputElement>(null)
  const resolveImageInputRef = useRef<HTMLInputElement>(null)

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Cập nhật tiến độ
      </h2>

      <textarea
        value={progressNote}
        onChange={(e) => setProgressNote(e.target.value)}
        placeholder="Nhập ghi chú tiến độ..."
        rows={4}
        className="mt-4 w-full rounded-lg border p-3"
      />

      <button
        type="button"
        disabled={addProgressNote.isPending || !progressNote.trim()}
        onClick={() => {
          addProgressNote.mutate(
            { note: progressNote },
            {
              onSuccess: () => {
                setProgressNote('')
              },
            },
          )
        }}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
      >
        {addProgressNote.isPending ? 'Đang lưu...' : 'Thêm ghi chú'}
      </button>

      {addProgressNote.isError && (
        <p className="mt-2 text-sm text-red-600">Không thể thêm ghi chú.</p>
      )}

      <div className="mt-6 border-t border-gray-700 pt-6">
        <h3 className="text-base font-semibold text-gray-100">Ảnh tiến độ</h3>

        <input
          ref={progressImageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            setProgressImages(Array.from(e.target.files ?? []))
          }}
          className="mt-3 block w-full text-sm text-gray-300"
        />

        {progressImages.length > 0 && (
          <p className="mt-2 text-sm text-gray-400">
            Đã chọn {progressImages.length} ảnh
          </p>
        )}

        <button
          type="button"
          disabled={uploadProgressImages.isPending || progressImages.length === 0}
          onClick={() => {
            uploadProgressImages.mutate(
              { files: progressImages },
              {
                onSuccess: () => {
                  setProgressImages([])

                  if (progressImageInputRef.current) {
                    progressImageInputRef.current.value = ''
                  }
                },
              },
            )
          }}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {uploadProgressImages.isPending ? 'Đang tải ảnh...' : 'Tải ảnh tiến độ'}
        </button>

        {uploadProgressImages.isError && (
          <p className="mt-2 text-sm text-red-600">Không thể tải ảnh tiến độ.</p>
        )}
      </div>

      <div className="mt-6 border-t border-gray-700 pt-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Hoàn thành xử lý
        </h3>

        <textarea
          value={resolveNote}
          onChange={(e) => setResolveNote(e.target.value)}
          placeholder="Nhập kết quả xử lý..."
          rows={3}
          className="mt-3 w-full rounded-lg border p-3"
        />

        <input
          ref={resolveImageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            setResolveImages(Array.from(e.target.files ?? []))
          }}
          className="mt-3 block w-full text-sm text-gray-300"
        />

        {resolveImages.length > 0 && (
          <p className="mt-2 text-sm text-gray-400">
            Đã chọn {resolveImages.length} ảnh kết quả
          </p>
        )}

        <button
          type="button"
          disabled={
            resolveReport.isPending || !resolveNote.trim() || resolveImages.length === 0
          }
          onClick={() => {
            resolveReport.mutate(
              {
                note: resolveNote,
                images: resolveImages,
              },
              {
                onSuccess: () => {
                  setResolveNote('')
                  setResolveImages([])

                  if (resolveImageInputRef.current) {
                    resolveImageInputRef.current.value = ''
                  }
                },
              },
            )
          }}
          className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-60"
        >
          {resolveReport.isPending ? 'Đang hoàn thành...' : 'Hoàn thành xử lý'}
        </button>

        {resolveReport.isError && (
          <p className="mt-2 text-sm text-red-600">Không thể hoàn thành xử lý.</p>
        )}
      </div>
    </Card>
  )
}

import { useRef, useState } from 'react'

import { Card } from '@/components/ui/Card'

import {
  useAddProgressNote,
  useResolveReport,
  useUploadProgressImages,
} from '../staff.queries'
import {
  getErrorMessage,
  getImageValidationErrors,
  getNoteValidationError,
  STAFF_IMAGE_ACCEPT,
  STAFF_IMAGE_MAX_COUNT,
  STAFF_NOTE_MAX_LENGTH,
  STAFF_NOTE_MIN_LENGTH,
} from '../staff-report-validation'

interface ProgressUpdateCardProps {
  reportId: string
}

export function ProgressUpdateCard({ reportId }: ProgressUpdateCardProps) {
  const addProgressNote = useAddProgressNote(reportId)
  const uploadProgressImages = useUploadProgressImages(reportId)
  const resolveReport = useResolveReport(reportId)

  const [progressNote, setProgressNote] = useState('')
  const [progressImages, setProgressImages] = useState<File[]>([])
  const [progressImageErrors, setProgressImageErrors] = useState<string[]>([])
  const [resolveNote, setResolveNote] = useState('')
  const [resolveImages, setResolveImages] = useState<File[]>([])
  const [resolveImageErrors, setResolveImageErrors] = useState<string[]>([])

  const progressImageInputRef = useRef<HTMLInputElement>(null)
  const resolveImageInputRef = useRef<HTMLInputElement>(null)

  const progressNoteError = getNoteValidationError(progressNote, 'Ghi chú tiến độ')
  const resolveNoteError = getNoteValidationError(resolveNote, 'Ghi chú kết quả')

  const canUploadProgressImages =
    progressImages.length > 0 && progressImageErrors.length === 0
  const canResolve =
    resolveNoteError === null &&
    resolveImages.length > 0 &&
    resolveImageErrors.length === 0

  function handleProgressImageSelection(files: File[]) {
    setProgressImages(files)
    setProgressImageErrors(getImageValidationErrors(files, 'ảnh tiến độ'))
  }

  function handleResolveImageSelection(files: File[]) {
    setResolveImages(files)
    setResolveImageErrors(getImageValidationErrors(files, 'ảnh kết quả xử lý'))
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Cập nhật tiến độ
      </h2>

      <section aria-labelledby="progress-note-heading">
        <h3
          id="progress-note-heading"
          className="mt-4 text-base font-semibold text-gray-900 dark:text-gray-100"
        >
          Ghi chú tiến độ
        </h3>

        <label
          htmlFor="progress-note"
          className="mt-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Nội dung ghi chú
        </label>

        <textarea
          id="progress-note"
          value={progressNote}
          onChange={(event) => setProgressNote(event.target.value)}
          placeholder="Nhập ghi chú tiến độ..."
          rows={4}
          maxLength={STAFF_NOTE_MAX_LENGTH}
          disabled={addProgressNote.isPending}
          aria-invalid={progressNote.length > 0 && progressNoteError !== null}
          aria-describedby="progress-note-help"
          className="mt-1 w-full rounded-lg border border-gray-300 p-3 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800"
        />

        <div
          id="progress-note-help"
          className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-gray-500 dark:text-gray-400"
        >
          <span>
            Từ {STAFF_NOTE_MIN_LENGTH} đến {STAFF_NOTE_MAX_LENGTH} ký tự.
          </span>
          <span>
            {progressNote.length}/{STAFF_NOTE_MAX_LENGTH}
          </span>
        </div>

        {progressNote.length > 0 && progressNoteError && (
          <p className="mt-2 text-sm text-red-600">{progressNoteError}</p>
        )}

        <button
          type="button"
          disabled={addProgressNote.isPending || progressNoteError !== null}
          onClick={() => {
            if (progressNoteError !== null) {
              return
            }

            addProgressNote.mutate(
              { note: progressNote.trim() },
              {
                onSuccess: () => {
                  setProgressNote('')
                },
              },
            )
          }}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {addProgressNote.isPending ? 'Đang lưu...' : 'Thêm ghi chú'}
        </button>

        {addProgressNote.isError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {getErrorMessage(addProgressNote.error, 'Không thể thêm ghi chú.')}
          </p>
        )}

        {addProgressNote.isSuccess && (
          <p role="status" className="mt-2 text-sm text-green-600">
            Đã thêm ghi chú tiến độ.
          </p>
        )}
      </section>

      <section
        aria-labelledby="progress-images-heading"
        className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700"
      >
        <h3
          id="progress-images-heading"
          className="text-base font-semibold text-gray-900 dark:text-gray-100"
        >
          Ảnh tiến độ
        </h3>

        <label
          htmlFor="progress-images"
          className="mt-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Chọn ảnh tiến độ
        </label>

        <input
          ref={progressImageInputRef}
          id="progress-images"
          type="file"
          accept={STAFF_IMAGE_ACCEPT}
          multiple
          disabled={uploadProgressImages.isPending}
          onChange={(event) => {
            handleProgressImageSelection(Array.from(event.target.files ?? []))
          }}
          aria-invalid={progressImageErrors.length > 0}
          aria-describedby="progress-images-help"
          className="mt-1 block w-full text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-300"
        />

        <p
          id="progress-images-help"
          className="mt-2 text-sm text-gray-500 dark:text-gray-400"
        >
          JPEG, PNG hoặc WEBP; từ 1 đến {STAFF_IMAGE_MAX_COUNT} ảnh; tối đa 5 MB mỗi ảnh.
        </p>

        {progressImages.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đã chọn {progressImages.length}/{STAFF_IMAGE_MAX_COUNT} ảnh
            </p>

            <button
              type="button"
              disabled={uploadProgressImages.isPending}
              onClick={() => {
                setProgressImages([])
                setProgressImageErrors([])

                if (progressImageInputRef.current) {
                  progressImageInputRef.current.value = ''
                }
              }}
              className="text-sm font-medium text-red-600 disabled:opacity-60"
            >
              Xóa ảnh tiến độ đã chọn
            </button>
          </div>
        )}

        {progressImageErrors.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-red-600">
            {progressImageErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <button
          type="button"
          disabled={uploadProgressImages.isPending || !canUploadProgressImages}
          onClick={() => {
            const errors = getImageValidationErrors(progressImages, 'ảnh tiến độ')

            setProgressImageErrors(errors)

            if (errors.length > 0) {
              return
            }

            uploadProgressImages.mutate(
              { files: progressImages },
              {
                onSuccess: () => {
                  setProgressImages([])
                  setProgressImageErrors([])

                  if (progressImageInputRef.current) {
                    progressImageInputRef.current.value = ''
                  }
                },
              },
            )
          }}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploadProgressImages.isPending ? 'Đang tải ảnh...' : 'Tải ảnh tiến độ'}
        </button>

        {uploadProgressImages.isError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {getErrorMessage(uploadProgressImages.error, 'Không thể tải ảnh tiến độ.')}
          </p>
        )}

        {uploadProgressImages.isSuccess && (
          <p role="status" className="mt-2 text-sm text-green-600">
            Đã tải ảnh tiến độ.
          </p>
        )}
      </section>

      <section
        aria-labelledby="resolve-report-heading"
        className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700"
      >
        <h3
          id="resolve-report-heading"
          className="text-base font-semibold text-gray-900 dark:text-gray-100"
        >
          Hoàn thành xử lý
        </h3>

        <label
          htmlFor="resolve-note"
          className="mt-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Kết quả xử lý
        </label>

        <textarea
          id="resolve-note"
          value={resolveNote}
          onChange={(event) => setResolveNote(event.target.value)}
          placeholder="Nhập kết quả xử lý..."
          rows={3}
          maxLength={STAFF_NOTE_MAX_LENGTH}
          disabled={resolveReport.isPending}
          aria-invalid={resolveNote.length > 0 && resolveNoteError !== null}
          aria-describedby="resolve-note-help"
          className="mt-1 w-full rounded-lg border border-gray-300 p-3 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800"
        />

        <div
          id="resolve-note-help"
          className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-gray-500 dark:text-gray-400"
        >
          <span>
            Từ {STAFF_NOTE_MIN_LENGTH} đến {STAFF_NOTE_MAX_LENGTH} ký tự.
          </span>
          <span>
            {resolveNote.length}/{STAFF_NOTE_MAX_LENGTH}
          </span>
        </div>

        {resolveNote.length > 0 && resolveNoteError && (
          <p className="mt-2 text-sm text-red-600">{resolveNoteError}</p>
        )}

        <label
          htmlFor="resolve-images"
          className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Ảnh minh chứng
        </label>

        <input
          ref={resolveImageInputRef}
          id="resolve-images"
          type="file"
          accept={STAFF_IMAGE_ACCEPT}
          multiple
          disabled={resolveReport.isPending}
          onChange={(event) => {
            handleResolveImageSelection(Array.from(event.target.files ?? []))
          }}
          aria-invalid={resolveImageErrors.length > 0}
          aria-describedby="resolve-images-help"
          className="mt-1 block w-full text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-300"
        />

        <p
          id="resolve-images-help"
          className="mt-2 text-sm text-gray-500 dark:text-gray-400"
        >
          Bắt buộc từ 1 đến {STAFF_IMAGE_MAX_COUNT} ảnh JPEG, PNG hoặc WEBP; tối đa 5 MB
          mỗi ảnh.
        </p>

        {resolveImages.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đã chọn {resolveImages.length}/{STAFF_IMAGE_MAX_COUNT} ảnh minh chứng
            </p>

            <button
              type="button"
              disabled={resolveReport.isPending}
              onClick={() => {
                setResolveImages([])
                setResolveImageErrors([])

                if (resolveImageInputRef.current) {
                  resolveImageInputRef.current.value = ''
                }
              }}
              className="text-sm font-medium text-red-600 disabled:opacity-60"
            >
              Xóa ảnh minh chứng đã chọn
            </button>
          </div>
        )}

        {resolveImageErrors.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-red-600">
            {resolveImageErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <button
          type="button"
          disabled={resolveReport.isPending || !canResolve}
          onClick={() => {
            const imageErrors = getImageValidationErrors(
              resolveImages,
              'ảnh kết quả xử lý',
            )

            setResolveImageErrors(imageErrors)

            if (resolveNoteError !== null || imageErrors.length > 0) {
              return
            }

            resolveReport.mutate(
              {
                note: resolveNote.trim(),
                images: resolveImages,
              },
              {
                onSuccess: () => {
                  setResolveNote('')
                  setResolveImages([])
                  setResolveImageErrors([])

                  if (resolveImageInputRef.current) {
                    resolveImageInputRef.current.value = ''
                  }
                },
              },
            )
          }}
          className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resolveReport.isPending ? 'Đang hoàn thành...' : 'Hoàn thành xử lý'}
        </button>

        {resolveReport.isError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {getErrorMessage(resolveReport.error, 'Không thể hoàn thành xử lý.')}
          </p>
        )}

        {resolveReport.isSuccess && (
          <p role="status" className="mt-2 text-sm text-green-600">
            Báo cáo đã được chuyển sang trạng thái đã giải quyết.
          </p>
        )}
      </section>
    </Card>
  )
}

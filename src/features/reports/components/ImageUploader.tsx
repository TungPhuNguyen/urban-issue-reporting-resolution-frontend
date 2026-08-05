import { useEffect, useRef, useState, type ChangeEvent } from 'react'

interface ImageUploaderProps {
  value: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMb?: number
  disabled?: boolean
  error?: string
  className?: string
}

interface ImagePreviewProps {
  file: File
  disabled: boolean
  onRemove: () => void
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function isSameFile(firstFile: File, secondFile: File) {
  return (
    firstFile.name === secondFile.name &&
    firstFile.size === secondFile.size &&
    firstFile.lastModified === secondFile.lastModified
  )
}

function ImagePreview({ file, disabled, onRemove }: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)

    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  return (
    <div className="relative overflow-hidden rounded-md border border-gray-300">
      {previewUrl && (
        <img
          src={previewUrl}
          alt={`Ảnh xem trước ${file.name}`}
          className="h-28 w-full object-cover"
        />
      )}

      <button
        type="button"
        disabled={disabled}
        aria-label={`Xóa ảnh ${file.name}`}
        className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onRemove}
      >
        ×
      </button>

      <p className="truncate px-2 py-1 text-xs text-gray-600" title={file.name}>
        {file.name}
      </p>
    </div>
  )
}

export function ImageUploader({
  value,
  onChange,
  maxFiles = 5,
  maxSizeMb = 5,
  disabled = false,
  error,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const maxSizeBytes = maxSizeMb * 1024 * 1024

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])

    const newErrors: string[] = []
    const acceptedFiles: File[] = []

    for (const file of selectedFiles) {
      const duplicatedInCurrentValue = value.some((existingFile) =>
        isSameFile(existingFile, file),
      )

      const duplicatedInNewSelection = acceptedFiles.some((acceptedFile) =>
        isSameFile(acceptedFile, file),
      )

      if (duplicatedInCurrentValue || duplicatedInNewSelection) {
        newErrors.push(`Ảnh "${file.name}" đã được chọn trước đó.`)
        continue
      }

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        newErrors.push(`Ảnh "${file.name}" không đúng định dạng JPG, PNG hoặc WEBP.`)
        continue
      }

      if (file.size > maxSizeBytes) {
        newErrors.push(`Ảnh "${file.name}" vượt quá ${maxSizeMb} MB.`)
        continue
      }

      if (value.length + acceptedFiles.length >= maxFiles) {
        newErrors.push(`Bạn chỉ được chọn tối đa ${maxFiles} ảnh.`)
        break
      }

      acceptedFiles.push(file)
    }

    if (acceptedFiles.length > 0) {
      onChange([...value, ...acceptedFiles])
    }

    setValidationErrors(newErrors)

    // Cho phép chọn lại cùng một file sau khi đã xóa.
    event.target.value = ''
  }

  const removeImage = (indexToRemove: number) => {
    const updatedFiles = value.filter((_, index) => index !== indexToRemove)

    onChange(updatedFiles)
    setValidationErrors([])
  }

  return (
    <div className={className}>
      <label htmlFor="report-images" className="w-full bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500">
        Hình ảnh sự cố
        <span className="ml-1 text-red-500">*</span>
      </label>

      <input
        ref={inputRef}
        id="report-images"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled || value.length >= maxFiles}
        onChange={handleFileChange}
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        aria-invalid={Boolean(error) || validationErrors.length > 0}
        aria-describedby={error ? 'report-images-error' : undefined}
      />

      <p className="mt-1 text-sm text-gray-500">
        Chấp nhận JPG, PNG hoặc WEBP. Tối đa {maxFiles} ảnh, mỗi ảnh không vượt quá{' '}
        {maxSizeMb} MB.
      </p>

      {value.length > 0 && (
        <>
          <p className="mt-2 text-sm font-medium">
            Đã chọn {value.length}/{maxFiles} ảnh
          </p>

          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {value.map((file, index) => (
              <ImagePreview
                key={`${file.name}-${file.size}-${file.lastModified}`}
                file={file}
                disabled={disabled}
                onRemove={() => {
                  removeImage(index)
                }}
              />
            ))}
          </div>
        </>
      )}

      {validationErrors.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-red-600">
          {validationErrors.map((validationError, index) => (
            <li key={`${validationError}-${index}`}>{validationError}</li>
          ))}
        </ul>
      )}

      {error && (
        <p id="report-images-error" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

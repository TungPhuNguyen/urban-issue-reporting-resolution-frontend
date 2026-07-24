import { useRef, useState } from 'react'

interface ImageUploaderProps {
  value: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMb?: number
  acceptedTypes?: string[]
  className?: string
}

export function ImageUploader({
  value,
  onChange,
  maxFiles = 5,
  maxSizeMb = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className,
}: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return

    setError(null)

    const incoming = Array.from(fileList)

    if (value.length + incoming.length > maxFiles) {
      setError(`Chỉ được chọn tối đa ${maxFiles} ảnh.`)
      return
    }

    for (const file of incoming) {
      if (!acceptedTypes.includes(file.type)) {
        setError(`Định dạng không hợp lệ: ${file.name}`)
        return
      }

      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`${file.name} vượt quá ${maxSizeMb}MB`)
        return
      }
    }

    onChange([...value, ...incoming])

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        id="image-upload"
        type="file"
        accept={acceptedTypes.join(',')}
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{
          padding: '8px 16px',
          cursor: 'pointer',
        }}
      >
        Chọn ảnh
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: 8 }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          marginTop: 12,
        }}
      >
        {value.map((file, index) => {
          const url = URL.createObjectURL(file)

          return (
            <div
              key={`${file.name}-${index}`}
              style={{ position: 'relative' }}
            >
              <img
                src={url}
                alt={file.name}
                style={{
                  width: 90,
                  height: 90,
                  objectFit: 'cover',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                }}
              />

              <button
                type="button"
                onClick={() => removeImage(index)}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      <p style={{ marginTop: 8 }}>
        {value.length}/{maxFiles} ảnh đã chọn
      </p>
    </div>
  )
}

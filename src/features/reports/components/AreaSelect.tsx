import { usePublicAreas } from '@/features/public-catalog/public-catalog.queries'

interface AreaSelectProps {
  id?: string
  value: number | null
  onChange: (areaId: number | null) => void
  parentAreaId?: number
  enabled?: boolean
  disabled?: boolean
  error?: string
  label?: string
  placeholder?: string
  className?: string
}

export function AreaSelect({
  id = 'areaId',
  value,
  onChange,
  parentAreaId,
  enabled = true,
  disabled = false,
  error,
  label = 'Khu vực',
  placeholder = '-- Chọn khu vực --',
  className,
}: AreaSelectProps) {
  const {
    data: areas = [],
    isLoading,
    isError,
    refetch,
  } = usePublicAreas(
    parentAreaId,
    enabled,
  )

  const errorId = `${id}-error`

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium"
      >
        {label}

        <span className="ml-1 text-red-500">
          *
        </span>
      </label>

      <select
        id={id}
        value={value ?? ''}
        disabled={
          disabled ||
          !enabled ||
          isLoading
        }
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? errorId : undefined
        }
        onChange={(event) => {
          const selectedValue =
            event.target.value

          onChange(
            selectedValue === ''
              ? null
              : Number(selectedValue),
          )
        }}
        className="w-full rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <option value="">
          {!enabled
            ? '-- Chọn quận/huyện trước --'
            : isLoading
              ? 'Đang tải khu vực...'
              : placeholder}
        </option>

        {areas.map((area) => (
          <option
            key={area.id}
            value={area.id}
          >
            {area.name}
            {area.code
              ? ` (${area.code})`
              : ''}
          </option>
        ))}
      </select>

      {enabled && isError && (
        <div className="mt-1 text-sm text-red-600">
          <span>
            Không tải được danh sách khu vực.
          </span>

          <button
            type="button"
            className="ml-2 underline"
            onClick={() => {
              void refetch()
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      {enabled &&
        !isLoading &&
        !isError &&
        areas.length === 0 && (
          <p className="mt-1 text-sm text-gray-500">
            Hiện chưa có khu vực phù hợp.
          </p>
        )}

      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  )
}
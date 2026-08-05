import { usePublicCategories } from '@/features/public-catalog/public-catalog.queries'

interface CategorySelectProps {
  id?: string
  value: number | null
  onChange: (categoryId: number | null) => void
  disabled?: boolean
  error?: string
  className?: string
}

export function CategorySelect({
  id = 'categoryId',
  value,
  onChange,
  disabled = false,
  error,
  className,
}: CategorySelectProps) {
  const { data: categories = [], isLoading, isError, refetch } = usePublicCategories()

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="w-full bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
      >
        Loại sự cố
        <span className="ml-1 text-red-500">*</span>
      </label>

      <select
        id={id}
        value={value ?? ''}
        disabled={disabled || isLoading || categories.length === 0}
        onChange={(event) => {
          const selectedValue = event.target.value

          onChange(selectedValue ? Number(selectedValue) : null)
        }}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">
          {isLoading ? 'Đang tải loại sự cố...' : '-- Chọn loại sự cố --'}
        </option>

        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {isError && (
        <div className="mt-1 text-sm text-red-600">
          <span>Không tải được danh sách loại sự cố.</span>

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

      {!isLoading && !isError && categories.length === 0 && (
        <p className="mt-1 text-sm text-gray-500">Hiện chưa có loại sự cố nào.</p>
      )}

      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

import { usePublicCategories } from '../reports.queries'

interface CategorySelectProps {
  value: number | null
  onChange: (categoryId: number | null) => void
  className?: string
}

export function CategorySelect({ value, onChange, className }: CategorySelectProps) {
  const { data: categories, isLoading, isError } = usePublicCategories()

  if (isLoading) {
    return <div className={className}>Đang tải loại sự cố...</div>
  }

  if (isError) {
    return <div className={className}>Không tải được danh sách loại sự cố.</div>
  }

  return (
    <select
      className={className}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">-- Chọn loại sự cố --</option>
      {categories?.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  )
}

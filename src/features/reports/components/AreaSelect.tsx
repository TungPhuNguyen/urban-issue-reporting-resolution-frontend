import { usePublicAreas } from '../reports.queries'

interface AreaSelectProps {
  value: number | null
  onChange: (areaId: number | null) => void
  parentAreaId?: number
  className?: string
}

export function AreaSelect({ value, onChange, parentAreaId, className }: AreaSelectProps) {
  const { data: areas, isLoading, isError } = usePublicAreas(parentAreaId)

  if (isLoading) {
    return <div className={className}>Đang tải khu vực...</div>
  }

  if (isError) {
    return <div className={className}>Không tải được danh sách khu vực.</div>
  }

  return (
    <select
      className={className}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">-- Chọn khu vực --</option>
      {areas?.map((area) => (
        <option key={area.id} value={area.id}>
          {area.name}
        </option>
      ))}
    </select>
  )
}

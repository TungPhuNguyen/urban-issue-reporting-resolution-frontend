import { AreaSelect } from './AreaSelect'

interface AreaHierarchyValue {
  parentAreaId: number | null
  areaId: number | null
}

interface AreaHierarchySelectProps {
  value: AreaHierarchyValue
  onChange: (value: AreaHierarchyValue) => void
  disabled?: boolean
  parentError?: string
  areaError?: string
}

export function AreaHierarchySelect({
  value,
  onChange,
  disabled = false,
  parentError,
  areaError,
}: AreaHierarchySelectProps) {
  const handleParentChange = (parentAreaId: number | null) => {
    onChange({
      parentAreaId,
      areaId: null,
    })
  }

  const handleAreaChange = (areaId: number | null) => {
    onChange({
      parentAreaId: value.parentAreaId,
      areaId,
    })
  }

  return (
    <div className="space-y-4">
      <AreaSelect
        id="parentAreaId"
        label="Thành phố"
        placeholder="-- Chọn Thành phố --"
        value={value.parentAreaId}
        onChange={handleParentChange}
        disabled={disabled}
        error={parentError}
      />

      <AreaSelect
        id="areaId"
        label="Phường/Xã"
        placeholder={
          value.parentAreaId === null
            ? '-- Chọn Thành phố trước --'
            : '-- Chọn phường/xã --'
        }
        parentAreaId={value.parentAreaId ?? undefined}
        value={value.areaId}
        onChange={handleAreaChange}
        enabled={value.parentAreaId !== null}
        disabled={disabled}
        error={areaError}
      />
    </div>
  )
}

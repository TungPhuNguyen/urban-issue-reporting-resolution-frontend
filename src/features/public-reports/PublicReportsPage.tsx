import { useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { Link } from 'react-router-dom'

import { ReportCard } from '@/components/reports/ReportCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { getStatusLabel } from '@/components/ui/report-labels'
import {
  usePublicAreas,
  usePublicCategories,
} from '@/features/public-catalog/public-catalog.queries'
import { REPORT_STATUS, type ReportStatus } from '@/features/reports/report.types'
import { useDebounce } from '@/hooks/useDebounce'

import { usePublicReports } from './public-reports.queries'
import type { PublicReportSort } from './public-reports.types'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const markerIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const STATUSES: ReportStatus[] = Object.values(REPORT_STATUS)

export default function PublicReportsPage() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [status, setStatus] = useState<ReportStatus | ''>('')
  const [sortBy, setSortBy] = useState<PublicReportSort>('Newest')
  const [coordinates, setCoordinates] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const debouncedSearch = useDebounce(search.trim(), 300)
  const categoriesQuery = usePublicCategories()
  const rootAreasQuery = usePublicAreas(null)
  const rootAreaId = rootAreasQuery.data?.[0]?.id ?? null

  const areasQuery = usePublicAreas(rootAreaId, rootAreaId !== null)
  const reportsQuery = usePublicReports({
    search: debouncedSearch || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    areaId: areaId ? Number(areaId) : undefined,
    status: status || undefined,
    sortBy,
    currentLatitude: coordinates?.latitude,
    currentLongitude: coordinates?.longitude,
    pageNumber,
    pageSize: 50,
  })
  const reports = useMemo(
    () => reportsQuery.data?.items ?? [],
    [reportsQuery.data?.items],
  )
  const center = useMemo<[number, number]>(() => {
    const first = reports[0]
    return first ? [first.latitude, first.longitude] : [21.0285, 105.8542]
  }, [reports])

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
      setSortBy('Nearby')
      setPageNumber(1)
    })
  }

  return (
    <section className="public-reports-page mx-auto max-w-7xl px-4 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bản đồ phản ánh đô thị</h1>
          <p className="mt-1 text-gray-600">
            Theo dõi các sự cố đã được cộng đồng gửi và tiến độ xử lý.
          </p>
        </div>
        <Link to="/lookup" className="text-sm font-medium text-blue-600 hover:underline">
          Tra cứu bằng mã báo cáo
        </Link>
      </div>

      <Card className="mt-6 grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
        <input
          value={search}
          placeholder="Tìm kiếm..."
          onChange={(e) => {
            setSearch(e.target.value)
            setPageNumber(1)
          }}
          className="h-10 rounded-lg border border-gray-300 px-3"
        />
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value)
            setPageNumber(1)
          }}
          className="h-10 rounded-lg border border-gray-300 px-3"
        >
          <option value="">Tất cả danh mục</option>
          {categoriesQuery.data?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={areaId}
          disabled={rootAreaId === null || areasQuery.isPending}
          onChange={(e) => {
            setAreaId(e.target.value)
            setPageNumber(1)
          }}
          className="h-10 rounded-lg border border-gray-300 px-3"
        >
          <option value="">
            {areasQuery.isPending ? 'Đang tải phường/xã...' : 'Tất cả phường/xã'}
          </option>

          {areasQuery.data?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ReportStatus | '')
            setPageNumber(1)
          }}
          className="h-10 rounded-lg border border-gray-300 px-3"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {getStatusLabel(item)}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as PublicReportSort)}
          className="h-10 rounded-lg border border-gray-300 px-3"
        >
          <option value="Newest">Mới nhất</option>
          <option value="MostUpvoted">Nhiều ủng hộ</option>
          <option value="Nearby" disabled={!coordinates}>
            Gần tôi{coordinates ? '' : ' (cần cấp vị trí)'}
          </option>
        </select>
        <Button type="button" variant="secondary" onClick={useMyLocation}>
          Dùng vị trí của tôi
        </Button>
      </Card>

      <div className="mt-6 grid gap-6 lg:h-[clamp(380px,calc(100dvh_-_360px),620px)] lg:grid-cols-[1.15fr_.85fr]">
        <Card className="h-[420px] overflow-hidden p-0 lg:h-full">
          <MapContainer
            key={`${center[0]}-${center[1]}`}
            center={center}
            zoom={12}
            className="relative z-0"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {reports.map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <strong>{report.title}</strong>
                  <br />
                  {report.reportCode}
                  <br />
                  <Link to={`/reports/${report.id}`}>Xem chi tiết</Link>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Card>
        <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1 lg:h-full lg:max-h-none">
          {reportsQuery.isPending ? (
            <Spinner label="Đang tải báo cáo..." />
          ) : reportsQuery.isError ? (
            <Card className="p-6 text-red-600">Không thể tải báo cáo.</Card>
          ) : reports.length === 0 ? (
            <EmptyState
              title="Không có báo cáo phù hợp"
              description="Hãy thay đổi bộ lọc và thử lại."
            />
          ) : (
            reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                to={`/reports/${report.id}`}
                showReportId
              />
            ))
          )}
        </div>
      </div>
      {(reportsQuery.data?.totalPages ?? 0) > 1 && (
        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="secondary"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => p - 1)}
          >
            Trang trước
          </Button>
          <span className="self-center text-sm">
            Trang {pageNumber}/{reportsQuery.data?.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={pageNumber >= (reportsQuery.data?.totalPages ?? 1)}
            onClick={() => setPageNumber((p) => p + 1)}
          >
            Trang sau
          </Button>
        </div>
      )}
    </section>
  )
}

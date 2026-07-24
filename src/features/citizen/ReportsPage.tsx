import { Link } from 'react-router-dom'

export default function CitizenReportsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Báo cáo của tôi
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Theo dõi các phản ánh hạ tầng mà bạn đã gửi.
          </p>
        </div>

        <Link
          to="/citizen/reports/create"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Tạo phản ánh mới
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">
          Danh sách phản ánh
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Chức năng danh sách đầy đủ sẽ được bổ sung trong
          use case quản lý báo cáo của Citizen.
        </p>

        <Link
          to="/citizen/reports/create"
          className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Gửi phản ánh đầu tiên
        </Link>
      </div>
    </div>
  )
}
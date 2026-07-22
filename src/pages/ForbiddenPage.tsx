import { Link } from 'react-router-dom'

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold">
        403
      </h1>

      <h2 className="mt-4 text-2xl font-semibold">
        Không có quyền truy cập
      </h2>

      <p className="mt-2 text-gray-600">
        Tài khoản của bạn không được phép truy cập trang này.
      </p>

      <Link
        to="/"
        className="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Về trang chủ
      </Link>
    </div>
  )
}
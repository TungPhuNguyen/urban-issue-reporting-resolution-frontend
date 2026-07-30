import { Link, Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="flex h-16 items-center justify-between border-b bg-white px-6">
        <Link to="/" className="font-bold text-gray-800">
          Urban Issue Reporting System
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-700 hover:text-blue-600">
            Đăng nhập
          </Link>

          <Link
            to="/register"
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Đăng ký
          </Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

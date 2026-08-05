import { MapPinned } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            aria-label="Urban Issue - Trang chủ"
            className="flex min-w-0 items-center gap-3"
          >
            <span className="bg-brand-600 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white">
              <MapPinned aria-hidden="true" className="h-5 w-5" />
            </span>

            <span className="min-w-0">
              <span className="block truncate font-bold text-gray-900 dark:text-white">
                Urban Issue
              </span>
              <span className="hidden text-xs text-gray-500 sm:block dark:text-gray-400">
                Hệ thống phản ánh sự cố đô thị
              </span>
            </span>
          </Link>

          <nav
            aria-label="Điều hướng công khai"
            className="flex items-center gap-2 sm:gap-3"
          >
            <Link
              to="/login"
              className="focus-visible:ring-brand-500 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:outline-none dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              Đăng nhập
            </Link>

            <Link
              to="/register"
              className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-500 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Đăng ký
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

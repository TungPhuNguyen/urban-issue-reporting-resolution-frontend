import { Suspense } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/auth.store'
import { supportedLocales } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { clsx } from 'clsx'

export function AppLayout() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const link = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-100'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
    )

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-6">
          <span className="text-brand-600 text-lg font-bold">{t('app.name')}</span>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={link}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/users" className={link}>
              {t('nav.users')}
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <select
            aria-label="Language"
            value={i18n.resolvedLanguage}
            onChange={(e) => void i18n.changeLanguage(e.target.value)}
            className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {supportedLocales.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
          {user && <span className="text-sm text-gray-500">{user.name}</span>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            {t('nav.logout')}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}

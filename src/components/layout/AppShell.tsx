import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LogOut, Menu, X, type LucideIcon } from 'lucide-react'
import { clsx } from 'clsx'

import { Button } from '@/components/ui/Button'
import type { UserRole } from '@/features/auth/auth.types'

export interface AppShellMenuItem {
  label: string
  path: string
  icon?: LucideIcon
  end?: boolean
}

interface AppShellProps {
  title: string
  role: UserRole
  userName: string
  menuItems: AppShellMenuItem[]
  isLoggingOut: boolean
  onLogout: () => void | Promise<void>
}

interface SidebarContentProps extends AppShellProps {
  closeButton?: ReactNode
  onNavigate?: () => void
}

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function SidebarContent({
  title,
  role,
  userName,
  menuItems,
  isLoggingOut,
  onLogout,
  closeButton,
  onNavigate,
}: SidebarContentProps) {
  const userInitial = userName.trim().charAt(0).toUpperCase() || '?'

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-800">
        <div>
          <p className="font-bold text-gray-900 dark:text-white">Urban Issue</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        </div>

        {closeButton}
      </div>

      <nav
        aria-label={`${role} navigation`}
        className="flex-1 space-y-1 overflow-y-auto p-4"
      >
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-100'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
                )
              }
            >
              {Icon && <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />}
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold">
            {userInitial}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {userName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isLoggingOut}
          onClick={() => void onLogout()}
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </Button>
      </div>
    </>
  )
}

export function AppShell(props: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuId = useId()
  const mobileMenuRef = useRef<HTMLElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const menuTrigger = menuTriggerRef.current
    document.body.style.overflow = 'hidden'

    const menu = mobileMenuRef.current
    const focusableElements = menu
      ? Array.from(menu.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS))
      : []

    ;(focusableElements[0] ?? menu)?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsMobileMenuOpen(false)

        return
      }

      if (event.key !== 'Tab' || !mobileMenuRef.current) {
        return
      }

      const currentFocusableElements = Array.from(
        mobileMenuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS),
      )

      if (currentFocusableElements.length === 0) {
        event.preventDefault()
        mobileMenuRef.current.focus()

        return
      }

      const firstElement = currentFocusableElements[0]!
      const lastElement = currentFocusableElements.at(-1)!

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      menuTrigger?.focus()
    }
  }, [isMobileMenuOpen])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex dark:border-gray-800 dark:bg-gray-900">
        <SidebarContent {...props} />
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            aria-hidden="true"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <aside
            ref={mobileMenuRef}
            id={mobileMenuId}
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            tabIndex={-1}
            className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl dark:bg-gray-900"
          >
            <SidebarContent
              {...props}
              onNavigate={() => setIsMobileMenuOpen(false)}
              closeButton={
                <button
                  type="button"
                  aria-label="Đóng menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </button>
              }
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur lg:px-6 dark:border-gray-800 dark:bg-gray-900/95">
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label="Mở menu"
            aria-controls={mobileMenuId}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>

          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">{props.title}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Urban Issue Reporting System
            </p>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

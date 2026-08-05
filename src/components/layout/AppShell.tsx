import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  X,
  type LucideIcon,
} from 'lucide-react'
import { clsx } from 'clsx'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { CivicPulseLogo } from '@/components/ui/CivicPulseLogo'
import type { UserRole } from '@/features/auth/auth.types'

export interface AppShellMenuItem {
  label: string
  path: string
  icon?: LucideIcon
  end?: boolean
  accent?: boolean
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
  menuItems,
  isLoggingOut,
  onLogout,
  closeButton,
  onNavigate,
}: SidebarContentProps) {
  return (
    <>
      <div className="sidebar__top">
        <CivicPulseLogo />
        {closeButton}
      </div>

      <div className="sidebar__role">
        <span className="sidebar__role-icon">
          <ShieldCheck aria-hidden="true" size={18} />
        </span>
        <div>
          <small>Không gian làm việc</small>
          <strong>{title}</strong>
        </div>
      </div>

      <nav aria-label={`${role} navigation`} className="sidebar__nav">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                clsx(isActive && 'active bg-brand-50', item.accent && 'accent')
              }
            >
              {Icon && <Icon aria-hidden="true" size={19} />}
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar__footer">
        <button type="button" disabled>
          <Settings2 aria-hidden="true" size={18} />
          <span>Hồ sơ &amp; cài đặt</span>
        </button>
        <button type="button" disabled={isLoggingOut} onClick={() => void onLogout()}>
          <LogOut aria-hidden="true" size={18} />
          <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
        </button>
      </div>
    </>
  )
}

export function AppShell(props: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const mobileMenuId = useId()
  const mobileMenuRef = useRef<HTMLElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const userInitial = props.userName.trim().charAt(0).toUpperCase() || '?'
  const notificationsPath = `/${props.role.toLowerCase()}/notifications`

  useEffect(() => {
    if (!isMobileMenuOpen) return

    const previousOverflow = document.body.style.overflow
    const menuTrigger = menuTriggerRef.current
    document.body.style.overflow = 'hidden'

    const menu = mobileMenuRef.current
    const closeButton = menu?.querySelector<HTMLElement>('button[aria-label="Đóng menu"]')
    closeButton?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsMobileMenuOpen(false)
        return
      }

      if (event.key !== 'Tab' || !mobileMenuRef.current) return

      const currentFocusableElements = Array.from(
        mobileMenuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS),
      )
      const firstElement = currentFocusableElements[0]
      const lastElement = currentFocusableElements.at(-1)

      if (!firstElement || !lastElement) {
        event.preventDefault()
        mobileMenuRef.current.focus()
      } else if (event.shiftKey && document.activeElement === firstElement) {
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
    <div className="app-shell">
      <aside className="sidebar hidden lg:flex">
        <SidebarContent {...props} />
      </aside>

      {isMobileMenuOpen && (
        <>
          <button
            className="sidebar-overlay block lg:hidden"
            type="button"
            aria-label="Đóng menu bằng lớp nền"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside
            ref={mobileMenuRef}
            id={mobileMenuId}
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            tabIndex={-1}
            className="sidebar sidebar--open fixed lg:hidden"
          >
            <SidebarContent
              {...props}
              onNavigate={() => setIsMobileMenuOpen(false)}
              closeButton={
                <button
                  type="button"
                  aria-label="Đóng menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="icon-button sidebar__close"
                >
                  <X aria-hidden="true" size={20} />
                </button>
              }
            />
          </aside>
        </>
      )}

      <div className="app-main">
        <header className="app-header">
          <div className="app-header__left">
            <button
              ref={menuTriggerRef}
              type="button"
              aria-label="Mở menu"
              aria-controls={mobileMenuId}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(true)}
              className="icon-button app-header__menu"
            >
              <Menu aria-hidden="true" size={21} />
            </button>
            <div className="app-header__crumb">
              <small>Civic Pulse</small>
              <strong>{props.title}</strong>
            </div>
          </div>

          <div className="app-header__actions">
            <Link
              className="notification-button"
              to={notificationsPath}
              aria-label="Thông báo"
            >
              <Bell aria-hidden="true" size={20} />
            </Link>

            <div className="profile-menu">
              <button
                type="button"
                className="profile-menu__trigger"
                onClick={() => setIsProfileOpen((value) => !value)}
                aria-expanded={isProfileOpen}
              >
                <span className="avatar">{userInitial}</span>
                <span className="profile-menu__identity">
                  <strong>{props.userName}</strong>
                  <small>{props.role}</small>
                </span>
                <ChevronDown aria-hidden="true" size={16} />
              </button>

              {isProfileOpen && (
                <div className="profile-menu__dropdown">
                  <span>
                    <CircleUserRound aria-hidden="true" size={17} /> {props.role}
                  </span>
                  <button type="button" onClick={() => void props.onLogout()}>
                    <LogOut aria-hidden="true" size={17} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { CivicPulseLogo } from '@/components/ui/CivicPulseLogo'
import { useAuthStore } from '@/features/auth/auth.store'

const roleHome = {
  Admin: '/admin/dashboard',
  Staff: '/staff/dashboard',
  Citizen: '/citizen/reports',
} as const

export default function PublicLayout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const isAuthPage = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ].includes(location.pathname)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  if (isAuthPage) {
    return <Outlet />
  }

  const home = user ? roleHome[user.role] : '/citizen/reports'

  return (
    <div className="landing-page flex min-h-dvh flex-col">
      <header className={`public-header ${scrolled ? 'public-header--scrolled' : ''}`}>
        <div className="public-header__inner container">
          <CivicPulseLogo ariaLabel="Urban Issue - Trang chủ" />

          <nav
            aria-label="Điều hướng công khai"
            className={`public-nav ${menuOpen ? 'public-nav--open' : ''}`}
          >
            <NavLink to="/">Trang chủ</NavLink>
            <NavLink to="/reports">Bản đồ phản ánh</NavLink>
            <NavLink to="/lookup">Tra cứu</NavLink>
            {/* <a href="/#how-it-works">Quy trình</a>
            <a href="/#impact">Minh bạch</a> */}
          </nav>

          <div className="public-header__actions">
            {isAuthenticated ? (
              <Link to={home}>
                <Button variant="dark">
                  Vào hệ thống <ArrowUpRight aria-hidden="true" size={18} />
                </Button>
              </Link>
            ) : (
              <>
                <Link className="text-link public-header__login" to="/login">
                  Đăng nhập
                </Link>
                <Link to="/register" aria-label="Đăng ký">
                  <Button>
                    Báo cáo ngay <ArrowUpRight aria-hidden="true" size={18} />
                  </Button>
                </Link>
              </>
            )}

            <button
              className="menu-toggle"
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <main className={`flex-1 ${location.pathname === '/' ? '' : 'public-main'}`}>
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="public-footer__grid container">
          <div className="public-footer__brand">
            <CivicPulseLogo />
            <p>
              Nền tảng báo cáo và xử lý sự cố hạ tầng đô thị minh bạch, hiệu quả và lấy
              người dân làm trung tâm.
            </p>
          </div>
          <div>
            <strong>Sản phẩm</strong>
            <Link to="/register">Tạo báo cáo</Link>
            <Link to="/reports">Bản đồ phản ánh</Link>
            <Link to="/login" aria-label="Đăng nhập tại chân trang">
              Đăng nhập
            </Link>
          </div>
          <div>
            <strong>Khám phá</strong>
            <a href="/#how-it-works">Quy trình</a>
            <a href="/#impact">Tác động</a>
            <a href="mailto:support@civicpulse.vn">Hỗ trợ</a>
          </div>
          <div>
            <strong>Liên hệ</strong>
            <span>support@civicpulse.vn</span>
            <span>1900 2026</span>
            <span>Hà Nội, Việt Nam</span>
          </div>
        </div>
        <div className="public-footer__bottom container">
          <span>© 2026 Civic Pulse. Urban Issue Reporting &amp; Resolution.</span>
          <div>
            <span>Quyền riêng tư</span>
            <span>Điều khoản</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

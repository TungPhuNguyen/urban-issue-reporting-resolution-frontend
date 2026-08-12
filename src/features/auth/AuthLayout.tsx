import type { ReactNode } from 'react'
import { ArrowLeft, BadgeCheck, Building2, MapPinned, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CivicPulseLogo } from '@/components/ui/CivicPulseLogo'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <aside className="auth-visual">
        <div className="auth-visual__grid" aria-hidden="true" />
        <div className="auth-visual__top">
          <CivicPulseLogo />
        </div>
        <div className="auth-visual__content">
          <span className="auth-visual__badge">
            <ShieldCheck aria-hidden="true" size={16} /> Nền tảng đô thị minh bạch
          </span>
          <h1>
            Mỗi phản ánh được lắng nghe.
            <br /> Mỗi tiến độ được nhìn thấy.
          </h1>
          <p>
            Kết nối người dân với đơn vị xử lý trên một quy trình rõ ràng, có trách nhiệm
            và có thể kiểm chứng.
          </p>
          <div className="auth-visual__cards">
            <div>
              <MapPinned aria-hidden="true" />
              <strong>126</strong>
              <span>Phường/xã kết nối</span>
            </div>
            <div>
              <BadgeCheck aria-hidden="true" />
              <strong>88.4%</strong>
              <span>Giải quyết đúng hạn</span>
            </div>
            <div>
              <Building2 aria-hidden="true" />
              <strong>24/7</strong>
              <span>Theo dõi tiến độ</span>
            </div>
          </div>
        </div>
        <div className="auth-visual__footer">
          Civic Pulse · Urban Issue Reporting &amp; Resolution
        </div>
      </aside>

      <main className="auth-form-panel">
        <Link to="/" className="auth-back">
          <ArrowLeft aria-hidden="true" size={17} /> Về trang chủ
        </Link>
        <section className="auth-form-card">
          <div className="auth-form-card__heading">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
        </section>
      </main>
    </div>
  )
}

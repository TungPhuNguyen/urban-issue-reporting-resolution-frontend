import { type FormEvent, useState } from 'react'
import { AlertCircle, Eye, EyeOff, LockKeyhole, LogIn, Mail } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'

import { AuthLayout } from './AuthLayout'
import { useAuthStore } from './auth.store'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const status = useAuthStore((state) => state.status)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const isLoading = status === 'loading'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')

    if (!email.trim()) {
      setFormError('Email không được để trống.')
      return
    }

    if (!password) {
      setFormError('Mật khẩu không được để trống.')
      return
    }

    try {
      const user = await login({ email: email.trim(), password })
      const redirectTo = (location.state as { from?: string } | null)?.from

      if (redirectTo) {
        navigate(redirectTo, { replace: true })
        return
      }

      const roleHome = {
        Admin: '/admin/dashboard',
        Staff: '/staff/reports',
        Citizen: '/citizen/reports',
      } as const

      navigate(roleHome[user.role], { replace: true })
    } catch {
      setFormError('Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.')
    }
  }

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục theo dõi và xử lý các báo cáo đô thị."
    >
      {formError && (
        <div className="auth-alert auth-alert--error" role="alert">
          <AlertCircle aria-hidden="true" size={18} />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="field">
          <span className="field__label">Email</span>
          <span className="input-with-icon">
            <Mail aria-hidden="true" size={18} />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              autoComplete="email"
              placeholder="ban@example.com"
            />
          </span>
        </label>

        <label className="field">
          <span className="field__label">Mật khẩu</span>
          <span className="input-with-icon">
            <LockKeyhole aria-hidden="true" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        <div className="auth-form__row">
          <label className="check-row">
            <input type="checkbox" />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <span className="muted text-sm">Bảo mật bằng JWT</span>
        </div>

        <Button type="submit" size="lg" loading={isLoading} className="button--full">
          <LogIn aria-hidden="true" size={18} /> Đăng nhập
        </Button>
      </form>

      <p className="auth-switch">
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
    </AuthLayout>
  )
}

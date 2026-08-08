import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/lib/api/http'
import { AuthLayout } from './AuthLayout'
import { authApi } from './auth.api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) {
      setError('Vui lòng nhập email.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await authApi.forgotPassword(email.trim())
      setNotice('Nếu email tồn tại, hệ thống đã gửi liên kết đặt lại mật khẩu.')
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không thể gửi yêu cầu.',
      )
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email để nhận liên kết đặt lại mật khẩu."
    >
      {notice && <div className="auth-alert auth-alert--success">{notice}</div>}
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      <form className="auth-form" onSubmit={submit}>
        <label className="field">
          <span className="field__label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@example.com"
          />
        </label>
        <Button type="submit" size="lg" loading={loading} className="button--full">
          Gửi liên kết
        </Button>
      </form>
      <p className="auth-switch">
        <Link to="/login">Quay lại đăng nhập</Link>
      </p>
    </AuthLayout>
  )
}

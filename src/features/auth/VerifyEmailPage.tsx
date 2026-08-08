import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/lib/api/http'
import { AuthLayout } from './AuthLayout'
import { authApi } from './auth.api'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [token, setToken] = useState(params.get('token') ?? '')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const automatic = useRef(false)
  async function verify() {
    if (!email.trim() || !token.trim()) {
      setError('Vui lòng nhập email và mã xác minh.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await authApi.verifyEmail(email.trim(), token.trim())
      setNotice('Xác minh email thành công. Bạn có thể đăng nhập.')
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không thể xác minh email.',
      )
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (email && token && !automatic.current) {
      automatic.current = true
      void verify()
    }
  })
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void verify()
  }
  async function resend() {
    setLoading(true)
    setError(null)
    try {
      await authApi.resendVerificationEmail(email.trim())
      setNotice('Đã gửi lại email xác minh.')
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không thể gửi lại email.',
      )
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthLayout
      title="Xác minh email"
      subtitle="Hoàn tất xác minh để kích hoạt tài khoản."
    >
      {notice && <div className="auth-alert auth-alert--success">{notice}</div>}
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      <form className="auth-form" onSubmit={submit}>
        <label className="field">
          <span className="field__label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Mã xác minh</span>
          <input value={token} onChange={(e) => setToken(e.target.value)} />
        </label>
        <Button type="submit" size="lg" loading={loading} className="button--full">
          Xác minh
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!email.trim() || loading}
          onClick={() => void resend()}
        >
          Gửi lại email xác minh
        </Button>
      </form>
      <p className="auth-switch">
        <Link to="/login">Đăng nhập</Link>
      </p>
    </AuthLayout>
  )
}

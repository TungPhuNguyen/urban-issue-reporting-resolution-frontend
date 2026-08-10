import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/lib/api/http'
import { AuthLayout } from './AuthLayout'
import { authApi } from './auth.api'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [token, setToken] = useState(params.get('token') ?? '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirm) {
      setError('Xác nhận mật khẩu không khớp.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await authApi.resetPassword({
        email: email.trim(),
        token: token.trim(),
        newPassword: password,
        confirmNewPassword: confirm,
      })
      setNotice('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.')
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Không thể đặt lại mật khẩu.',
      )
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthLayout title="Đặt lại mật khẩu" subtitle="Tạo mật khẩu mới cho tài khoản.">
      {notice && <div className="form-alert form-alert--success">{notice}</div>}
      {error && <div className="form-alert form-alert--error">{error}</div>}
      <form className="auth-form" onSubmit={submit}>
        <label className="field">
          <span className="field__label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Mã đặt lại</span>
          <input value={token} onChange={(e) => setToken(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Mật khẩu mới</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">Xác nhận mật khẩu</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        <Button type="submit" size="lg" loading={loading} className="button--full">
          Đặt lại mật khẩu
        </Button>
      </form>
      <p className="auth-switch">
        <Link to="/login">Đăng nhập</Link>
      </p>
    </AuthLayout>
  )
}

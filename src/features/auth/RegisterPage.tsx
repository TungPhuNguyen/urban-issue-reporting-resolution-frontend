import { useState, type FormEvent } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
  UserRoundPlus,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { ApiError } from '@/lib/api/http'

import { AuthLayout } from './AuthLayout'
import { authApi } from './auth.api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): string | null => {
    if (!fullName.trim()) return 'Họ và tên không được để trống.'
    if (!email.trim()) return 'Email không được để trống.'
    if (!email.includes('@')) return 'Email không hợp lệ.'
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.'
    if (!/[A-Z]/.test(password)) return 'Mật khẩu phải có ít nhất một chữ hoa.'
    if (!/[a-z]/.test(password)) return 'Mật khẩu phải có ít nhất một chữ thường.'
    if (!/\d/.test(password)) return 'Mật khẩu phải có ít nhất một chữ số.'
    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'Mật khẩu phải có ít nhất một ký tự đặc biệt.'
    }
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp.'
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')
    const validationError = validateForm()

    if (validationError) {
      setFormError(validationError)
      return
    }

    try {
      setIsLoading(true)
      const result = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        password,
        confirmPassword,
      })
      if (result.requiresEmailVerification || !result.accessToken) {
        setSuccessMessage(
          'Đăng ký thành công. Vui lòng kiểm tra email và xác minh tài khoản trước khi đăng nhập.',
        )
        window.setTimeout(
          () => navigate(`/verify-email?email=${encodeURIComponent(result.email)}`),
          1500,
        )
      } else {
        setSuccessMessage('Đăng ký thành công. Đang chuyển đến trang đăng nhập...')
        window.setTimeout(() => navigate('/login', { replace: true }), 1000)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const firstValidationError = error.fieldErrors
          ? Object.values(error.fieldErrors).flat()[0]
          : undefined
        setFormError(
          firstValidationError ??
            error.message ??
            'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.',
        )
      } else {
        setFormError('Đã xảy ra lỗi không xác định.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Tạo tài khoản công dân"
      subtitle="Tham gia Civic Pulse để gửi phản ánh và theo dõi kết quả xử lý."
    >
      {formError && (
        <div className="auth-alert auth-alert--error" role="alert">
          <AlertCircle aria-hidden="true" size={18} />
          <span>{formError}</span>
        </div>
      )}
      {successMessage && (
        <div className="auth-alert auth-alert--success" role="status">
          <CheckCircle2 aria-hidden="true" size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="field">
          <span className="field__label">Họ và tên</span>
          <span className="input-with-icon">
            <UserRound aria-hidden="true" size={18} />
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              disabled={isLoading}
              autoComplete="name"
              placeholder="Nguyễn Văn An"
            />
          </span>
        </label>

        <div className="form-grid form-grid--2">
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
            <span className="field__label">Số điện thoại</span>
            <span className="input-with-icon">
              <Phone aria-hidden="true" size={18} />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                disabled={isLoading}
                autoComplete="tel"
                placeholder="09xx xxx xxx"
              />
            </span>
          </label>
        </div>

        <label className="field">
          <span className="field__label">Mật khẩu</span>
          <span className="input-with-icon">
            <LockKeyhole aria-hidden="true" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự"
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

        <label className="field">
          <span className="field__label">Xác nhận mật khẩu</span>
          <span className="input-with-icon">
            <LockKeyhole aria-hidden="true" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
            />
          </span>
        </label>

        <Button type="submit" size="lg" loading={isLoading} className="button--full">
          <UserRoundPlus aria-hidden="true" size={18} /> Tạo tài khoản
        </Button>
      </form>

      <p className="auth-switch">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </AuthLayout>
  )
}

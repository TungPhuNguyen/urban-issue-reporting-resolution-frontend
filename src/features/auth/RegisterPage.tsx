import { ApiError } from '@/lib/api/http'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { authApi } from './auth.api'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): string | null => {
    if (!fullName.trim()) {
      return 'Họ và tên không được để trống.'
    }

    if (!email.trim()) {
      return 'Email không được để trống.'
    }

    if (!email.includes('@')) {
      return 'Email không hợp lệ.'
    }

    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự.'
    }

    if (!/[A-Z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất một chữ hoa.'
    }

    if (!/[a-z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất một chữ thường.'
    }

    if (!/\d/.test(password)) {
      return 'Mật khẩu phải có ít nhất một chữ số.'
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'Mật khẩu phải có ít nhất một ký tự đặc biệt.'
    }

    if (password !== confirmPassword) {
      return 'Mật khẩu xác nhận không khớp.'
    }

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

      await authApi.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        password,
        confirmPassword,
      })

      setSuccessMessage('Đăng ký thành công. Đang chuyển đến trang đăng nhập...')

      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1000)
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

        return
      }

      setFormError('Đã xảy ra lỗi không xác định.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">Đăng ký tài khoản</h1>

        {formError && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Họ và tên</label>

            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              disabled={isLoading}
              className="w-full rounded border px-3 py-2"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              className="w-full rounded border px-3 py-2"
              placeholder="citizen@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Số điện thoại</label>

            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              disabled={isLoading}
              className="w-full rounded border px-3 py-2"
              placeholder="0900000001"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Mật khẩu</label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              className="w-full rounded border px-3 py-2"
              placeholder="Password@123"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Xác nhận mật khẩu</label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isLoading}
              className="w-full rounded border px-3 py-2"
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}

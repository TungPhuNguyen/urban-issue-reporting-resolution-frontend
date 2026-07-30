import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuthStore } from './auth.store'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const login = useAuthStore((state) => state.login)
  const status = useAuthStore((state) => state.status)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      const user = await login({
        email: email.trim(),
        password,
      })

      const redirectTo = (location.state as { from?: string } | null)?.from

      if (redirectTo) {
        navigate(redirectTo, { replace: true })
        return
      }

      switch (user.role) {
        case 'Admin':
          navigate('/admin/dashboard', { replace: true })
          break

        case 'Staff':
          navigate('/staff/reports', { replace: true })
          break

        case 'Citizen':
          navigate('/citizen/reports', { replace: true })
          break
      }
    } catch {
      setFormError('Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">Đăng nhập</h1>

        {formError && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              className="w-full rounded border px-3 py-2"
              placeholder="Nhập email"
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
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  )
}

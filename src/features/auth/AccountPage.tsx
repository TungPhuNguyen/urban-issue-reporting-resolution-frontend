import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ApiError } from '@/lib/api/http'

import { authApi } from './auth.api'
import { useAuthStore } from './auth.store'

function message(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.fieldErrors) {
      return Object.values(error.fieldErrors)
        .flat()
        .join('\n')
    }

    return error.message
  }

  return fallback
}

export default function AccountPage() {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  if (!user) return null
  const currentUser = user

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    if (!fullName.trim() || fullName.trim().length > 150) {
      setError('Họ tên không hợp lệ.')
      return
    }
    setSavingProfile(true)
    try {
      const result = await authApi.updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || null,
      })
      updateUser({
        ...currentUser,
        fullName: result.fullName,
        phoneNumber: result.phoneNumber,
        departmentName: result.departmentName,
        isEmailVerified: result.isEmailVerified,
      })
      setNotice('Đã cập nhật hồ sơ.')
    } catch (requestError) {
      setError(message(requestError, 'Không thể cập nhật hồ sơ.'))
    } finally {
      setSavingProfile(false)
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    if (newPassword !== confirmNewPassword) {
      setError('Xác nhận mật khẩu mới không khớp.')
      return
    }
    setSavingPassword(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword, confirmNewPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setNotice('Đã đổi mật khẩu.')
    } catch (requestError) {
      setError(message(requestError, 'Không thể đổi mật khẩu.'))
    } finally {
      setSavingPassword(false)
    }
  }

  async function resendVerification() {
    setError(null)
    setNotice(null)
    try {
      await authApi.resendVerificationEmail(currentUser.email)
      setNotice('Đã gửi lại email xác minh.')
    } catch (requestError) {
      setError(message(requestError, 'Không thể gửi email xác minh.'))
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Hồ sơ &amp; cài đặt</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý thông tin tài khoản và mật khẩu.
        </p>
      </div>
      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error.split('\n').map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      )}
      {user.isEmailVerified === false && (
        <Card className="border-amber-200 bg-amber-50 p-5">
          <p className="font-medium text-amber-900">Email chưa được xác minh</p>
          <Button className="mt-3" size="sm" onClick={() => void resendVerification()}>
            Gửi lại email xác minh
          </Button>
        </Card>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Thông tin cá nhân</h2>
          <form className="mt-4 space-y-4" onSubmit={saveProfile}>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Họ và tên
              <input
                value={fullName}
                maxLength={150}
                onChange={(e) => setFullName(e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 dark:bg-gray-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Email
              <input
                value={user.email}
                disabled
                className="h-10 rounded-lg border border-gray-300 bg-gray-100 px-3"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Số điện thoại
              <input
                value={phoneNumber}
                maxLength={20}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 dark:bg-gray-900"
              />
            </label>
            <Button type="submit" loading={savingProfile}>
              Lưu hồ sơ
            </Button>
          </form>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
          <form className="mt-4 space-y-4" onSubmit={changePassword}>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Mật khẩu hiện tại
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 dark:bg-gray-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Mật khẩu mới
              <input
                type="password"
                value={newPassword}
                minLength={8}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 dark:bg-gray-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Xác nhận mật khẩu mới
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 dark:bg-gray-900"
              />
            </label>
            <Button type="submit" loading={savingPassword}>
              Đổi mật khẩu
            </Button>
          </form>
        </Card>
      </div>
    </section>
  )
}

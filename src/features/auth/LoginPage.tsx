import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from './auth.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface LocationState {
  from?: { pathname: string }
}

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, status, error } = useAuthStore()

  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password')

  const redirectTo = (location.state as LocationState)?.from?.pathname ?? '/'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch {
      /* error surfaced via store */
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-xl font-semibold">{t('auth.login')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('auth.signInToContinue')}</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="text-sm text-red-600">{t('auth.invalidCredentials')}</p>
          )}
          <Button type="submit" loading={status === 'loading'}>
            {t('auth.login')}
          </Button>
          <p className="text-center text-xs text-gray-400">demo@example.com / password</p>
        </form>
      </Card>
    </div>
  )
}

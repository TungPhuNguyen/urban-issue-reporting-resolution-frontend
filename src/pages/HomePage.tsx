import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'

export function HomePage() {
  const { t } = useTranslation()
  const features = [
    'React 19 + Vite',
    'TanStack Query + Zustand',
    'Tailwind CSS v4',
    'i18n (en/vi)',
    'Axios API layer + guards',
    'Vitest + Testing Library',
  ]
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{t('app.name')}</h1>
        <p className="mt-2 text-gray-500">{t('app.tagline')}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f} className="p-4 text-sm font-medium">
            {f}
          </Card>
        ))}
      </div>
      <Link to="/users" className="text-brand-600 hover:underline">
        {t('nav.users')} →
      </Link>
    </section>
  )
}

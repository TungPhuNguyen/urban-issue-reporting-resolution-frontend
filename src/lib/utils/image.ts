import { env } from '@/config/env'

export function getImageUrl(url: string | null | undefined) {
  if (!url) {
    return ''
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const baseUrl = env.apiBaseUrl.replace('/api/v1', '')

  return `${baseUrl}${url}`
}

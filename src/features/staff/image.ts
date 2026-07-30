import { env } from '@/config/env'

export function resolveImageUrl(
  imageUrl: string,
  apiBaseUrl: string,
  applicationOrigin: string,
) {
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  const apiOrigin = new URL(apiBaseUrl, applicationOrigin).origin
  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`

  return `${apiOrigin}${normalizedPath}`
}

export function getImageUrl(url: string | null | undefined) {
  if (!url) {
    return ''
  }

  return resolveImageUrl(url, env.apiBaseUrl, window.location.origin)
}
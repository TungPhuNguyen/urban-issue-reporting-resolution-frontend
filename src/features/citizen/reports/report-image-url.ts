export function resolveApiOrigin(apiBaseUrl: string, applicationOrigin: string): string {
  return new URL(apiBaseUrl, applicationOrigin).origin
}

export function resolveImageUrl(imageUrl: string, apiOrigin: string): string {
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`

  return `${apiOrigin}${normalizedPath}`
}

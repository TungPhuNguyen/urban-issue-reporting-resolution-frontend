/**
 * Centralized, typed access to runtime configuration.
 * Never read `import.meta.env` directly elsewhere — import from here so every
 * env dependency is discoverable and defaults live in one place.
 */
export const env = {
  appName:
    import.meta.env.VITE_APP_NAME ??
    'Urban Issue Reporting System',

  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ??
    'http://localhost:5180/api/v1',

  defaultLocale:
    import.meta.env.VITE_DEFAULT_LOCALE ?? 'vi',

  enableMock:
    import.meta.env.VITE_ENABLE_MOCK === 'true',

  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const

export type AppEnv = typeof env
 
import { useEffect } from 'react'
import { HubConnectionBuilder, LogLevel } from  '@microsoft/signalr'
import { useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { tokenStorage } from '@/lib/api/token-storage'

import { notificationKeys } from './notifications.queries'

function getHubUrl() {
  const url = new URL(env.apiBaseUrl, window.location.origin)
  url.pathname = url.pathname.replace(/\/api\/v1\/?$/, '/hubs/notifications')
  url.search = ''
  return url.toString()
}

export function useNotificationRealtime(enabled: boolean) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl(), {
        accessTokenFactory: () => tokenStorage.getAccess() ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(env.isDev ? LogLevel.Warning : LogLevel.None)
      .build()

    connection.on('NotificationCreated', () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    })

    void connection.start().catch(() => undefined)

    return () => {
      void connection.stop()
    }
  }, [enabled, queryClient])
}

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { notificationsApi } from './notifications.api'
import type { NotificationListParams } from './notifications.types'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params: NotificationListParams) =>
    [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}

export function useNotifications(params: NotificationListParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.getMine(params),
    placeholderData: keepPreviousData,
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 60_000,
  })
}

function invalidateNotifications(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: notificationKeys.all,
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => invalidateNotifications(queryClient),
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => invalidateNotifications(queryClient),
  })
}

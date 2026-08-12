import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { notificationsApi } from './notifications.api'
import type { NotificationListParams } from './notifications.types'
import { useAuthStore } from '@/features/auth/auth.store'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: (userId: string) => [...notificationKeys.all, userId, 'list'] as const,
  list: (userId: string, params: NotificationListParams) =>
    [...notificationKeys.lists(userId), params] as const,
  unreadCount: (userId: string) =>
    [...notificationKeys.all, userId, 'unread-count'] as const,
}

export function useNotifications(params: NotificationListParams) {
  const userId = useAuthStore((state) => state.user?.userId)

  return useQuery({
    queryKey: notificationKeys.list(userId ?? 'anonymous', params),
    queryFn: () => notificationsApi.getMine(params),
    placeholderData: keepPreviousData,
    enabled: Boolean(userId),
  })
}

export function useUnreadNotificationCount() {
  const userId = useAuthStore((state) => state.user?.userId)

  return useQuery({
    queryKey: notificationKeys.unreadCount(userId ?? 'anonymous'),
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 60_000,
    enabled: Boolean(userId),
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

import { http } from '@/lib/api/http'

import type {
  MarkAllReadResult,
  NotificationItem,
  NotificationListParams,
  PagedResult,
} from './notifications.types'

export const notificationsApi = {
  getMine: async (
    params: NotificationListParams,
  ): Promise<PagedResult<NotificationItem>> => {
    const response = await http.get<PagedResult<NotificationItem>>('/notifications', {
      params: {
        isRead: params.isRead,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      },
    })

    return response.data
  },

  markAsRead: async (id: number): Promise<NotificationItem> => {
    const response = await http.patch<NotificationItem>(`/notifications/${id}/read`)

    return response.data
  },

  markAllAsRead: async (): Promise<MarkAllReadResult> => {
    const response = await http.patch<MarkAllReadResult>('/notifications/read-all')

    return response.data
  },
}

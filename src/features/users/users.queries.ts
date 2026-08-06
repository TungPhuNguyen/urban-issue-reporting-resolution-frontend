import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { usersApi } from './users.api'
import type {
  AdminUserListParams,
  ChangeUserStatusInput,
  StaffInput,
} from './users.types'

export const userKeys = {
  all: ['admin', 'users'] as const,
  list: (params: AdminUserListParams) => [...userKeys.all, 'list', params] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}

export function useUsers(params: AdminUserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  })
}
export function useUser(id: string | null) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ''),
    queryFn: () => usersApi.get(id!),
    enabled: Boolean(id),
  })
}
export function useChangeUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ChangeUserStatusInput) => usersApi.changeStatus(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}
export function useSaveStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: StaffInput) => usersApi.saveStaff(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

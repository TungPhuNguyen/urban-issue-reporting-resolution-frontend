import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { routingRulesApi } from './routing-rules.api'
import type {
  CreateRoutingRuleInput,
  RoutingRuleListParams,
  UpdateRoutingRuleInput,
} from './routing-rules.types'

export const routingRuleKeys = {
  all: ['admin', 'routing-rules'] as const,

  lists: () => [...routingRuleKeys.all, 'list'] as const,

  list: (params: RoutingRuleListParams) => [...routingRuleKeys.lists(), params] as const,

  detail: (id: number) => [...routingRuleKeys.all, 'detail', id] as const,

  catalogs: () => [...routingRuleKeys.all, 'catalogs'] as const,

  categories: () => [...routingRuleKeys.catalogs(), 'categories'] as const,

  areas: () => [...routingRuleKeys.catalogs(), 'areas'] as const,

  departments: () => [...routingRuleKeys.catalogs(), 'departments'] as const,
}

export function useRoutingRules(params: RoutingRuleListParams) {
  return useQuery({
    queryKey: routingRuleKeys.list(params),

    queryFn: () => routingRulesApi.getAll(params),

    placeholderData: keepPreviousData,
  })
}

export function useRoutingRule(id: number | null) {
  return useQuery({
    queryKey: routingRuleKeys.detail(id ?? 0),

    queryFn: () => routingRulesApi.getById(id ?? 0),

    enabled: id !== null && id > 0,
  })
}

export function useRoutingRuleCatalogs() {
  const categoriesQuery = useQuery({
    queryKey: routingRuleKeys.categories(),

    queryFn: routingRulesApi.getActiveCategories,

    staleTime: 5 * 60 * 1000,
  })

  const areasQuery = useQuery({
    queryKey: routingRuleKeys.areas(),

    queryFn: routingRulesApi.getActiveAreas,

    staleTime: 5 * 60 * 1000,
  })

  const departmentsQuery = useQuery({
    queryKey: routingRuleKeys.departments(),

    queryFn: routingRulesApi.getActiveDepartments,

    staleTime: 5 * 60 * 1000,
  })

  return {
    categoriesQuery,
    areasQuery,
    departmentsQuery,
  }
}

export function useCreateRoutingRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRoutingRuleInput) => routingRulesApi.create(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: routingRuleKeys.lists(),
      })
    },
  })
}

export function useUpdateRoutingRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateRoutingRuleInput) => routingRulesApi.update(input),

    onSuccess: (result) => {
      queryClient.setQueryData(routingRuleKeys.detail(result.id), result)

      void queryClient.invalidateQueries({
        queryKey: routingRuleKeys.lists(),
      })
    },
  })
}

export function useDeleteRoutingRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => routingRulesApi.remove(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: routingRuleKeys.lists(),
      })
    },
  })
}

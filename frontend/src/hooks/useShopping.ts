import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttp } from '../context/HttpContext'
import { createShoppingItem, deleteShoppingItem, listShopping } from '../services/shopping'

const QUERY_KEY = ['shopping']

export function useShoppingQuery() {
  const client = useHttp()
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => listShopping(client),
    refetchInterval: 30_000,
  })
  return query
}

export function useCreateShoppingItem() {
  const client = useHttp()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (body: { item: string; quantity?: string }) => createShoppingItem(client, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
  return mutation
}

export function useDeleteShoppingItem() {
  const client = useHttp()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: string) => deleteShoppingItem(client, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
  return mutation
}

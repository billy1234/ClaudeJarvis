import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttp } from '../context/HttpContext'
import { completeTodo, createTodo, deleteTodo, listTodos } from '../services/todos'

const QUERY_KEY = ['todos']

export function useTodosQuery() {
  const client = useHttp()
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => listTodos(client),
    refetchInterval: 30_000,
  })
  return query
}

export function useCreateTodo() {
  const client = useHttp()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (body: { text: string; priority?: string; due_date?: string }) =>
      createTodo(client, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
  return mutation
}

export function useCompleteTodo() {
  const client = useHttp()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: string) => completeTodo(client, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
  return mutation
}

export function useDeleteTodo() {
  const client = useHttp()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: string) => deleteTodo(client, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
  return mutation
}

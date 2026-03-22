import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttp } from '../context/HttpContext'
import { createReminder, deleteReminder, dismissReminder, listReminders } from '../services/reminders'

const QUERY_KEY = ['reminders']

export function useRemindersQuery() {
  const client = useHttp()
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => listReminders(client),
    refetchInterval: 30_000,
  })
  return query
}

export function useCreateReminder() {
  const client = useHttp()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (body: { text: string; remind_at: string }) => createReminder(client, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
  return mutation
}

export function useDismissReminder() {
  const client = useHttp()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: string) => dismissReminder(client, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
  return mutation
}

export function useDeleteReminder() {
  const client = useHttp()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: string) => deleteReminder(client, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
  return mutation
}

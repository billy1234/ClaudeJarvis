import type { AxiosInstance } from 'axios'
import type { Reminder } from '../types/api.generated'

export async function listReminders(client: AxiosInstance): Promise<Reminder[]> {
  const { data } = await client.get<Reminder[]>('/reminders')
  return data
}

export async function createReminder(
  client: AxiosInstance,
  body: { text: string; remind_at: string },
): Promise<Reminder> {
  const { data } = await client.post<Reminder>('/reminders', body)
  return data
}

export async function dismissReminder(client: AxiosInstance, id: string): Promise<Reminder> {
  const { data } = await client.patch<Reminder>(`/reminders/${id}/dismiss`)
  return data
}

export async function deleteReminder(client: AxiosInstance, id: string): Promise<void> {
  await client.delete(`/reminders/${id}`)
}

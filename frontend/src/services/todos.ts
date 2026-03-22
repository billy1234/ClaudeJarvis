import type { AxiosInstance } from 'axios'
import type { Todo } from '../types/api.generated'

export async function listTodos(client: AxiosInstance): Promise<Todo[]> {
  const { data } = await client.get<Todo[]>('/todos')
  return data
}

export async function createTodo(
  client: AxiosInstance,
  body: { text: string; priority?: string; due_date?: string },
): Promise<Todo> {
  const { data } = await client.post<Todo>('/todos', body)
  return data
}

export async function completeTodo(client: AxiosInstance, id: string): Promise<Todo> {
  const { data } = await client.patch<Todo>(`/todos/${id}/complete`)
  return data
}

export async function deleteTodo(client: AxiosInstance, id: string): Promise<void> {
  await client.delete(`/todos/${id}`)
}

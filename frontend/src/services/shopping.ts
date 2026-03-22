import type { AxiosInstance } from 'axios'
import type { ShoppingItem } from '../types/api.generated'

export async function listShopping(client: AxiosInstance): Promise<ShoppingItem[]> {
  const { data } = await client.get<ShoppingItem[]>('/shopping')
  return data
}

export async function createShoppingItem(
  client: AxiosInstance,
  body: { item: string; quantity?: string },
): Promise<ShoppingItem> {
  const { data } = await client.post<ShoppingItem>('/shopping', body)
  return data
}

export async function deleteShoppingItem(client: AxiosInstance, id: string): Promise<void> {
  await client.delete(`/shopping/${id}`)
}

import axios, { type AxiosInstance } from 'axios'
import { createContext, useContext, type ReactNode } from 'react'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

const HttpContext = createContext<AxiosInstance>(client)

export function HttpProvider({ children }: { children: ReactNode }) {
  return <HttpContext.Provider value={client}>{children}</HttpContext.Provider>
}

export function useHttp(): AxiosInstance {
  return useContext(HttpContext)
}

import axios from 'axios'

// services contains shared integrations such as HTTP clients and SDK adapters.
export const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) =>
    Promise.reject(
      error instanceof Error ? error : new Error('Request failed.'),
    ),
)

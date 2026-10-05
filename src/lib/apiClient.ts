const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error(
    'Missing VITE_API_URL. Copy .env.example to .env.local and fill in your backend API URL.',
  )
}

export type ApiError = { message: string }
export type ApiResult<T> = { data: T | null; error: ApiError | null }

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const message = await response
        .json()
        .then((body) => body.message as string)
        .catch(() => `Request failed with status ${response.status}`)
      return { data: null, error: { message } }
    }

    if (response.status === 204) {
      return { data: null, error: null }
    }

    const body = await response.json()
    return { data: (body.data ?? body) as T, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { data: null, error: { message } }
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: Record<string, unknown>) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: Record<string, unknown>) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: Record<string, unknown>) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

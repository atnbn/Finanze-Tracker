import { trackLoading } from '@/composables/useLoadingIndicator'

const apiUrl = import.meta.env.VITE_API_URL

type ApiFetchOptions = {
  skipLoader?: boolean
}

function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${apiUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  options: ApiFetchOptions = {},
): Promise<Response> {
  const executeRequest = () =>
    fetch(buildApiUrl(path), {
      credentials: 'include',
      ...init,
    })

  if (options.skipLoader) {
    return executeRequest()
  }

  return trackLoading(executeRequest)
}

export async function readErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const data = await response.json().catch(() => null)

  return data?.error ?? fallbackMessage
}

import { readonly, ref } from 'vue'

export type ToastType = 'error' | 'success' | 'info' | 'warning'

export type ToastPayload = {
  type: ToastType
  title: string
  message: string
  duration?: number
}

export type ToastState = ToastPayload & {
  id: number
}

const DEFAULT_DURATION = 3200
const activeToast = ref<ToastState | null>(null)
let dismissTimeout: ReturnType<typeof setTimeout> | null = null

const clearDismissTimeout = () => {
  if (dismissTimeout) {
    clearTimeout(dismissTimeout)
    dismissTimeout = null
  }
}

export const hideToast = (): void => {
  clearDismissTimeout()
  activeToast.value = null
}

export const showToast = ({ duration = DEFAULT_DURATION, ...toast }: ToastPayload): void => {
  clearDismissTimeout()

  activeToast.value = {
    ...toast,
    duration,
    id: Date.now(),
  }

  dismissTimeout = setTimeout(() => {
    activeToast.value = null
    dismissTimeout = null
  }, duration)
}

export const useToast = () => ({
  toast: readonly(activeToast),
  showToast,
  hideToast,
})

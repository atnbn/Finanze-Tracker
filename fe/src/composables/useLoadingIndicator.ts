import { computed, readonly, ref } from 'vue'

const pendingRequests = ref(0)

function startLoading(): () => void {
  pendingRequests.value += 1

  let isFinished = false

  return () => {
    if (isFinished) {
      return
    }

    isFinished = true
    pendingRequests.value = Math.max(0, pendingRequests.value - 1)
  }
}

export async function trackLoading<T>(operation: Promise<T> | (() => Promise<T>)): Promise<T> {
  const stopLoading = startLoading()

  try {
    return typeof operation === 'function' ? await operation() : await operation
  } finally {
    stopLoading()
  }
}

export function useLoadingIndicator() {
  return {
    isLoading: computed(() => pendingRequests.value > 0),
    pendingRequests: readonly(pendingRequests),
  }
}

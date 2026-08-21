import { ref } from 'vue'
import type { ToastItem } from '~/types/wallpaper'
import { TOAST_DISPLAY_DURATION_MS, TOAST_EXIT_ANIMATION_MS } from '~/utils/constants'

const toasts = ref<ToastItem[]>([])

export function useToast() {
  function show({ msg, type }: { msg: string, type: 'ok' | 'err' }) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, msg, type, leaving: false })

    setTimeout(() => {
      const t = toasts.value.find(t => t.id === id)
      if (t) t.leaving = true
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, TOAST_EXIT_ANIMATION_MS)
    }, TOAST_DISPLAY_DURATION_MS)
  }

  return { toasts, show }
}

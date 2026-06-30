import { ref } from 'vue'
import type { ToastItem } from '~/types/wallpaper'

const toasts = ref<ToastItem[]>([])

export function useToast() {
  function show({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, msg, type, leaving: false })

    setTimeout(() => {
      const t = toasts.value.find((t) => t.id === id)
      if (t) t.leaving = true
      setTimeout(() => {
        toasts.value = toasts.value.filter((t) => t.id !== id)
      }, 350)
    }, 2800)
  }

  return { toasts, show }
}

import { ref, computed, onMounted } from 'vue'
import type { ThemeMode } from '~/types/wallpaper'

const CYCLE: Record<ThemeMode, ThemeMode> = { auto: 'light', light: 'dark', dark: 'auto' }

const mode = ref<ThemeMode>('auto')
const systemDark = ref(false)
const isDark = computed(() => mode.value === 'dark' || (mode.value === 'auto' && systemDark.value))

let _initialized = false

function applyColorScheme(m: ThemeMode) {
  const html = document.documentElement
  if (m === 'dark') {
    html.classList.add('dark')
    html.classList.remove('light')
  }
  else if (m === 'light') {
    html.classList.add('light')
    html.classList.remove('dark')
  }
  else {
    html.classList.remove('dark', 'light')
  }
  html.style.colorScheme = m === 'auto' ? 'light dark' : m
}

export function useTheme() {
  // Use onMounted instead of setup-time check — onMounted is guaranteed to run
  // in the browser after hydration, never on the server. This avoids the SSR
  // hydration race where import.meta.client may not reflect the correct
  // client context yet, leaving mode stuck at 'auto' even when localStorage
  // has an explicit saved value.
  onMounted(() => {
    if (_initialized) return
    _initialized = true

    const saved = localStorage.getItem('theme') as ThemeMode | null
    if (saved) mode.value = saved

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark.value = mq.matches
    mq.addEventListener('change', (e) => {
      systemDark.value = e.matches
      applyColorScheme(mode.value)
    })

    applyColorScheme(mode.value)
  })

  function cycle() {
    mode.value = CYCLE[mode.value]
    if (mode.value === 'auto') localStorage.removeItem('theme')
    else localStorage.setItem('theme', mode.value)
    applyColorScheme(mode.value)
  }

  return { mode, isDark, cycle }
}

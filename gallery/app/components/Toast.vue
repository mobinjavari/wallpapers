<script setup lang="ts">
import type { ToastItem } from '~/types/wallpaper'

defineProps<{ toast: ToastItem }>()
</script>

<template>
  <div :class="[
    'flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl shadow-black/30 text-xs font-semibold pointer-events-auto',
    toast.leaving ? 'toast-out' : 'toast-in',
    toast.type === 'ok' ? 'bg-toast-bg text-toast-fg' : 'bg-red-600 text-white',
  ]">
    <IconsCheckIcon v-if="toast.type === 'ok'" class="w-3.5 h-3.5 text-toast-success shrink-0" />
    <IconsClearIcon v-else class="w-3.5 h-3.5 text-white shrink-0" />
    <span>{{ toast.msg }}</span>
  </div>
</template>

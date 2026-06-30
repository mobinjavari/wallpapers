<script setup lang="ts">
const toast = useToast()
</script>

<template>
  <div class="fixed bottom-safe-6 left-1/2 -translate-x-1/2 z-60 flex flex-col items-center gap-2 pointer-events-none">
    <Toast v-for="t in toast.toasts.value" :key="t.id" :toast="t" />
  </div>
</template>

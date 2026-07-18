<script setup lang="ts">
const show = ref(false)

function onScroll() {
  show.value = window.scrollY > 500
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <button
    v-if="show"
    class="btn-press fixed bottom-safe-6 right-safe-6 z-40 w-9 h-9 rounded-xl bg-float text-fg-soft backdrop-blur-md border border-stroke shadow-xl hover:shadow-2xl hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
    aria-label="Scroll to top"
    @click="scrollToTop"
  >
    <IconsArrowUpIcon class="w-3.5 h-3.5" />
  </button>
</template>

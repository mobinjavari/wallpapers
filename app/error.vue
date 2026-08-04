<script setup lang="ts">
import { SITE_NAME } from '~/utils/seo'

const props = defineProps<{
  error: {
    statusCode: number
    statusMessage?: string
    message?: string
  }
}>()

const theme = useTheme()

useHead({
  title: `${props.error.statusCode} — ${SITE_NAME}`,
  meta: [{ name: 'robots', content: 'noindex' }],
})

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div :class="{ dark: theme.isDark.value }">
    <div class="bg-pattern bg-surface text-fg min-h-screen flex flex-col relative">
      <main class="flex-1 flex flex-col items-center justify-center text-center px-6 pb-16">
        <!-- Floating broken-frame icon -->
        <div class="mb-8 nf-float text-fg-faint">
          <IconsBrokenFrameIcon />
        </div>

        <h1
          class="nf-404 font-black leading-none select-none"
          :aria-label="String(error.statusCode)"
        >
          {{ error.statusCode }}
        </h1>

        <p class="mt-5 text-lg font-semibold text-fg">
          {{ error.statusCode === 404 ? 'Page not found' : 'Something went wrong' }}
        </p>
        <p class="mt-2 text-sm text-fg-muted max-w-xs leading-relaxed">
          {{
            error.statusCode === 404
              ? "This wallpaper doesn't exist or the URL has drifted into the void."
              : error.message ?? 'An unexpected error occurred.'
          }}
        </p>

        <button
          class="mt-8 inline-flex items-center gap-2 h-10 px-6 rounded-2xl bg-accent hover:bg-accent-hi text-white text-sm font-semibold transition-all btn-press shadow-lg shadow-accent/20"
          @click="handleError"
        >
          <IconsChevronLeftIcon class="w-3.5 h-3.5" />
          Browse Gallery
        </button>
      </main>

      <div
        class="pointer-events-none absolute inset-0 overflow-hidden -z-10"
        aria-hidden="true"
      >
        <div class="nf-glow-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.nf-404 {
  font-size: clamp(5rem, 20vw, 9rem);
  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #c084fc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 40px rgba(124, 58, 237, 0.25));
}

.nf-float {
  animation: nfFloat 5s ease-in-out infinite;
}

@keyframes nfFloat {

  0%,
  100% {
    transform: translateY(0px) rotate(-1deg);
  }

  50% {
    transform: translateY(-14px) rotate(1deg);
  }
}

.nf-glow-orb {
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%);
}

.dark .nf-glow-orb {
  background: radial-gradient(circle, rgba(124, 58, 237, 0.14) 0%, transparent 70%);
}
</style>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { formatFileSize } from '~/utils/download'
import type { WallpaperAuthor } from '~/types/wallpaper'

const lightbox = useLightbox()
const gallery = useGallery()
const downloadModal = useDownloadModal()
const { fetchDetail } = useWallpaperDetail()

// undefined = not yet fetched / loading; null = fetched but no author data
const author = ref<WallpaperAuthor | null | undefined>(undefined)

watch(
  () => lightbox.currentItem.value?.name,
  async (name) => {
    if (!name) { author.value = undefined; return }
    author.value = undefined
    const detail = await fetchDetail(name)
    author.value = detail?.author ?? null
  },
  { immediate: true },
)

const overlayEl = ref<HTMLElement | null>(null)
const isBrowserFullscreen = ref(false)

// Enter browser fullscreen when requested
watchEffect(() => {
  if (lightbox.pendingFullscreen.value && overlayEl.value) {
    overlayEl.value.requestFullscreen().catch(() => { })
    lightbox.clearPendingFullscreen()
  }
})

function onFullscreenChange() {
  isBrowserFullscreen.value = !!document.fullscreenElement
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => { })
  } else if (overlayEl.value) {
    overlayEl.value.requestFullscreen().catch(() => { })
  }
}

function onKeydown(e: KeyboardEvent) {
  if (!lightbox.isOpen.value) return
  if (e.key === 'ArrowLeft') lightbox.prev()
  else if (e.key === 'ArrowRight') lightbox.next()
  else if (e.key === 'Escape' && !document.fullscreenElement) lightbox.close()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<template>
  <div v-if="lightbox.isOpen.value" ref="overlayEl"
    class="fixed inset-0 z-50 bg-black flex items-center justify-center select-none lb-fade-in">
    <!-- Top-left: author badge -->
    <div v-if="lightbox.currentItem.value && !isBrowserFullscreen" class="lb-top-left absolute z-50">
      <!-- Skeleton while fetching -->
      <div v-if="author === undefined"
        class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 animate-pulse">
        <div class="w-5 h-5 rounded-full bg-white/20 shrink-0" />
        <div class="w-20 h-3 rounded bg-white/20" />
      </div>

      <!-- Author with GitHub account -->
      <a v-else-if="author?.profileUrl" :href="author.profileUrl" target="_blank" rel="noopener noreferrer"
        class="lb-author-badge flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10 transition-colors">
        <img v-if="author.avatarUrl" :src="author.avatarUrl" :alt="author.login ?? author.name"
          class="w-5 h-5 rounded-full shrink-0 ring-1 ring-white/20" />
        <svg v-else class="w-5 h-5 text-white/60 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
        <span class="text-xs font-medium text-white/90 leading-none">
          {{ author.login ?? author.name }}
        </span>
      </a>

      <!-- Author without GitHub account — no link, just name -->
      <div v-else-if="author"
        class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10">
        <svg class="w-5 h-5 text-white/60 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
        <span class="text-xs font-medium text-white/90 leading-none">
          {{ author.name }}
        </span>
      </div>
    </div>

    <!-- Top-right controls: fullscreen toggle + close -->
    <div class="lb-top-right absolute z-50 flex items-center gap-2">
      <button :title="isBrowserFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
        class="btn-press w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/10 flex items-center justify-center transition-all"
        @click="toggleFullscreen">
        <IconsFullscreenIcon class="w-4 h-4" :expanded="isBrowserFullscreen" />
      </button>
      <button
        class="btn-press w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/10 flex items-center justify-center transition-all hover:rotate-90 duration-200"
        @click="lightbox.close()">
        <IconsCloseIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Counter -->
    <div v-if="!lightbox.imgLoading.value"
      class="lb-counter absolute left-1/2 -translate-x-1/2 z-50 text-[11px] font-semibold text-white/40 tabular-nums">
      {{ lightbox.currentIndex.value + 1 }} / {{ lightbox.total.value }}
    </div>

    <!-- Prev -->
    <button v-if="lightbox.canPrev.value"
      class="btn-press absolute left-4 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/10 flex items-center justify-center transition-all"
      @click="lightbox.prev()">
      <IconsChevronLeftIcon class="w-4 h-4" />
    </button>

    <!-- Next -->
    <button v-if="lightbox.canNext.value"
      class="btn-press absolute right-4 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/10 flex items-center justify-center transition-all"
      @click="lightbox.next()">
      <IconsChevronRightIcon class="w-4 h-4" />
    </button>

    <!-- Spinner -->
    <div v-if="lightbox.imgLoading.value"
      class="absolute z-40 w-7 h-7 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />

    <!-- Image -->
    <img :src="lightbox.imgSrc.value" :alt="lightbox.imgAlt.value" :class="[
      'lb-img w-full h-full',
      isBrowserFullscreen ? 'object-cover' : 'max-w-full max-h-full object-contain',
      lightbox.imgLoading.value ? 'opacity-0' : 'opacity-100',
    ]" @load="lightbox.onImageLoad()" @error="lightbox.onImageError()" />

    <!-- Info bar -->
    <div v-if="lightbox.currentItem.value && !isBrowserFullscreen"
      class="lb-info-bar absolute bottom-0 inset-x-0 z-50 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 bg-linear-to-t from-black/70 to-transparent">
      <div class="min-w-0 flex items-center gap-2">
        <p class="text-sm font-semibold text-white truncate">
          {{ lightbox.currentItem.value.name }}
        </p>
        <span
          class="shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-white/15 text-white/80 uppercase tracking-wide">
          {{ lightbox.currentItem.value.ext }}
        </span>
        <span class="shrink-0 text-[11px] font-medium text-white/50 tabular-nums">
          {{ formatFileSize(lightbox.currentItem.value.size) }}
        </span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          class="btn-press w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/10 flex items-center justify-center transition-all"
          title="Copy link" @click="gallery.copyShareLink(lightbox.currentItem.value!)">
          <IconsLinkIcon class="w-4 h-4" />
        </button>
        <button
          class="btn-press w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all shadow-lg shadow-violet-900/50"
          title="Download" @click="
            downloadModal.open({
              url: lightbox.currentItem.value!.rawUrl,
              name: lightbox.currentItem.value!.name,
              ext: lightbox.currentItem.value!.ext,
            })
            ">
          <IconsDownloadIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lb-img {
  transition: opacity 280ms ease;
}

.lb-fade-in {
  animation: lbFadeIn 200ms ease-out forwards;
}

@keyframes lbFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.lb-top-left {
  top: calc(1rem + env(safe-area-inset-top, 0px));
  left: calc(1rem + env(safe-area-inset-left, 0px));
}

.lb-top-right {
  top: calc(1rem + env(safe-area-inset-top, 0px));
  right: calc(1rem + env(safe-area-inset-right, 0px));
}

.lb-author-badge {
  text-decoration: none;
}

.lb-counter {
  top: calc(1rem + env(safe-area-inset-top, 0px));
}

.lb-info-bar {
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
  padding-left: calc(1rem + env(safe-area-inset-left, 0px));
  padding-right: calc(1rem + env(safe-area-inset-right, 0px));
}
</style>

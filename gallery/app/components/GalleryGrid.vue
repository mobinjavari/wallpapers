<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import type { WallpaperItem } from '~/types/wallpaper'

const gallery = useGallery()
const downloadModal = useDownloadModal()

const scrollTriggerEl = ref<HTMLElement | null>(null)

const filterKey = computed(
  () =>
    gallery.liveSearch.value
    + gallery.activeTags.value.join('\0')
    + gallery.activeCategory.value,
)
const readyKey = computed(() => !gallery.isLoading.value && !gallery.hasError.value)

// Reset pagination and render first batch on filter change or data load
watchEffect(() => {
  void filterKey.value
  void readyKey.value
  gallery.resetAndRenderBatch()
})

// IntersectionObserver for infinite scroll
let observer: IntersectionObserver | null = null
watchEffect((onCleanup) => {
  const el = scrollTriggerEl.value
  if (!el) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && gallery.hasMore.value) {
        gallery.renderBatch()
      }
    },
    { rootMargin: '400px' },
  )
  observer.observe(el)
  onCleanup(() => observer?.disconnect())
})

function handleOpenDownload(item: WallpaperItem) {
  downloadModal.open({ url: item.rawUrl, name: item.name, ext: item.ext })
}
</script>

<template>
  <!-- Skeleton loading -->
  <div
    v-if="gallery.isLoading.value"
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
  >
    <div
      v-for="i in 20"
      :key="i"
      class="aspect-4/3 rounded-2xl bg-slate-300 dark:bg-slate-600 animate-skeleton"
    />
  </div>

  <!-- Error state -->
  <div
    v-if="gallery.hasError.value"
    class="flex flex-col items-center justify-center py-28 gap-3"
  >
    <div class="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
      <IconsErrorIcon class="w-7 h-7 text-red-400 dark:text-red-600" />
    </div>
    <p class="text-sm font-semibold text-slate-500 dark:text-slate-500">
      Failed to load wallpapers
    </p>
    <button
      class="h-8 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors btn-press"
      @click="gallery.init()"
    >
      Retry
    </button>
  </div>

  <!-- Gallery grid -->
  <div
    v-if="!gallery.isLoading.value && !gallery.hasError.value && gallery.visibleItems.value.length > 0"
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
  >
    <WallpaperCard
      v-for="(item, idx) in gallery.visibleItems.value"
      :key="item.rawUrl"
      :item="item"
      :index="idx"
      :priority="idx < 4"
      @openlightbox="(i) => gallery.openLightbox(i)"
      @opendownload="handleOpenDownload"
      @copylink="(i) => gallery.copyShareLink(i)"
      @tagclick="(tag) => gallery.triggerTagSearch(tag)"
    />
  </div>

  <!-- Empty state -->
  <div
    v-if="!gallery.isLoading.value && !gallery.hasError.value && gallery.filteredItems.value.length === 0"
    class="flex flex-col items-center justify-center py-28 gap-3"
  >
    <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/4 flex items-center justify-center">
      <IconsEmptySearchIcon class="w-7 h-7 text-slate-300 dark:text-slate-700" />
    </div>
    <p class="text-sm font-semibold text-slate-500 dark:text-slate-500">
      No wallpapers found
    </p>
    <button
      class="h-8 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-violet-500/20 btn-press"
      @click="gallery.resetAllFilters()"
    >
      Reset filters
    </button>
  </div>

  <!-- Infinite scroll sentinel -->
  <div
    v-if="gallery.hasMore.value && !gallery.isLoading.value && !gallery.hasError.value"
    ref="scrollTriggerEl"
    class="h-12 mt-4 flex items-center justify-center"
  >
    <div class="w-4 h-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin opacity-50" />
  </div>
</template>

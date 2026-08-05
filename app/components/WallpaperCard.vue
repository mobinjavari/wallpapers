<script setup lang="ts">
import { computed } from 'vue'
import type { WallpaperItem } from '~/types/wallpaper'
import { weservUrl } from '~/utils/image'
import { humanizeWallpaperName } from '~/utils/format'

const props = defineProps<{
  item: WallpaperItem
  index: number
  priority?: boolean
}>()

const emit = defineEmits<{
  openlightbox: [index: number]
  opendownload: [item: WallpaperItem]
  copylink: [item: WallpaperItem]
  tagclick: [tag: string]
}>()

const thumbUrl = computed(() => weservUrl(props.item.rawUrl, { w: 300, q: 75, output: 'webp' }))
const displayName = computed(() => humanizeWallpaperName(props.item.name))
</script>

<template>
  <div
    class="card group relative aspect-4/3 rounded-2xl overflow-hidden bg-surface-card ring-1 ring-stroke hover:ring-accent/40 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-0.5 transition-all duration-300 ease-out"
  >
    <img
      :src="thumbUrl"
      :alt="displayName"
      :loading="props.priority ? 'eager' : 'lazy'"
      :fetchpriority="props.priority ? 'high' : undefined"
      decoding="async"
      class="card-img w-full h-full object-cover"
    >

    <div class="card-overlay absolute inset-0 z-10" />

    <!-- Center: open wallpaper lightbox -->
    <div class="card-center absolute inset-0 z-20 flex items-center justify-center">
      <a
        :href="`/wallpaper/${encodeURIComponent(item.name)}`"
        class="btn-press w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/10 flex items-center justify-center transition-all"
        title="Open wallpaper"
        :aria-label="`Open ${displayName} wallpaper`"
        @click.prevent="emit('openlightbox', index)"
      >
        <IconsEyeIcon class="w-6 h-6" />
      </a>
    </div>

    <!-- Top: last 4 tags -->
    <div class="card-top absolute top-2.5 right-2.5 z-20 flex flex-wrap gap-1 justify-end max-w-[80%]">
      <a
        v-for="tag in item.hashtags.slice(-4)"
        :key="tag"
        :href="`/tag/${encodeURIComponent(tag)}`"
        class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/40 hover:bg-violet-600 text-white/90 backdrop-blur-sm border border-white/10 transition-all btn-press"
        @click.stop.prevent="emit('tagclick', tag)"
      >
        #{{ tag }}
      </a>
    </div>

    <!-- Bottom: name + actions -->
    <div class="card-bottom absolute bottom-0 inset-x-0 p-2.5 z-20 flex items-end justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[11px] font-semibold text-white leading-tight truncate">
          {{ displayName }}
        </p>
        <p class="text-[10px] font-bold text-white/40 uppercase mt-0.5">
          {{ item.ext }}
        </p>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button
          class="btn-press w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/10 flex items-center justify-center transition-all"
          title="Copy link"
          @click.stop="emit('copylink', item)"
        >
          <IconsLinkIcon class="w-3 h-3" />
        </button>
        <a
          :href="`/wallpaper/${encodeURIComponent(item.name)}`"
          class="btn-press w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all shadow-lg shadow-violet-900/50"
          title="Download"
          @click.prevent="emit('opendownload', item)"
        >
          <IconsDownloadIcon class="w-3 h-3" />
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-img {
  transition: transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.card:hover .card-img {
  transform: scale(1.07);
}

.card-overlay {
  background: linear-gradient(to top,
      rgba(0, 0, 0, 0.88) 0%,
      rgba(0, 0, 0, 0.3) 45%,
      rgba(0, 0, 0, 0.08) 100%);
  opacity: 0;
  transition: opacity 300ms ease;
}

.card:hover .card-overlay {
  opacity: 1;
}

.card-bottom {
  transform: translateY(6px);
  opacity: 0;
  transition:
    transform 300ms cubic-bezier(0.34, 1.2, 0.64, 1),
    opacity 250ms ease;
}

.card:hover .card-bottom {
  transform: translateY(0);
  opacity: 1;
}

.card-center {
  opacity: 0;
  transform: scale(0.85);
  transition:
    transform 300ms cubic-bezier(0.34, 1.2, 0.64, 1),
    opacity 250ms ease;
}

.card:hover .card-center {
  opacity: 1;
  transform: scale(1);
}

.card-top {
  transform: translateY(-6px);
  opacity: 0;
  transition:
    transform 300ms cubic-bezier(0.34, 1.2, 0.64, 1),
    opacity 250ms ease;
}

.card:hover .card-top {
  transform: translateY(0);
  opacity: 1;
}
</style>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { SITE_NAME } from '~/utils/seo'

const gallery = useGallery()
const theme = useTheme()

// Local mirror of search value — keeps input from resetting mid-keystroke
const searchValue = ref(gallery.liveSearch.value)
watchEffect(() => {
  const storeVal = gallery.liveSearch.value
  if (storeVal !== searchValue.value) {
    searchValue.value = storeVal
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-2 shrink-0 group" @click.prevent="gallery.resetAllFilters()">
      <div class="w-7 h-7 rounded-lg flex items-center justify-center">
        <IconsLogoIcon />
      </div>
      <span class="text-sm font-bold tracking-tight hidden sm:block">{{ SITE_NAME }}</span>
    </a>

    <!-- Search -->
    <div class="flex-1 max-w-md mx-auto">
      <div class="relative">
        <IconsSearchIcon
          class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-faint pointer-events-none" />
        <input type="text" :value="searchValue" placeholder="Search wallpapers..."
          class="w-full h-8 pl-8 pr-8 rounded-xl text-xs bg-surface-muted border border-transparent focus:border-accent/50 focus:ring-2 focus:ring-accent/10 text-fg placeholder-fg-faint outline-none transition-all"
          @input="
            (e) => {
              const v = (e.currentTarget as HTMLInputElement).value
              searchValue = v
              gallery.setSearch(v)
            }
          " />
        <button v-if="searchValue !== ''"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-faint hover:text-fg-soft transition-colors btn-press"
          @click="
            () => {
              searchValue = ''
              gallery.setSearch('')
            }
          ">
          <IconsClearIcon class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1.5 shrink-0">
      <!-- 3-state theme toggle: auto → light → dark → auto -->
      <button :title="theme.mode.value === 'auto'
        ? 'Theme: Auto (System)'
        : theme.mode.value === 'light'
          ? 'Theme: Light'
          : 'Theme: Dark'
        "
        class="btn-press w-8 h-8 rounded-xl flex items-center justify-center text-fg-soft hover:bg-surface-muted transition-colors overflow-hidden"
        @click="theme.cycle()">
        <!--
          ClientOnly prevents the SSR-rendered icon (always 'auto'/Monitor)
          from conflicting with the actual saved preference. Without this,
          Vue hydration sees a mismatch and may leave the wrong icon visible.
          The w-4 h-4 fallback keeps the button size stable during SSR.
        -->
        <ClientOnly>
          <span :key="theme.mode.value" class="inline-flex theme-spin">
            <IconsMonitorIcon v-if="theme.mode.value === 'auto'" class="w-4 h-4" />
            <IconsSunIcon v-else-if="theme.mode.value === 'light'" class="w-4 h-4" />
            <IconsMoonIcon v-else class="w-4 h-4" />
          </span>
          <template #fallback>
            <span class="inline-flex w-4 h-4" />
          </template>
        </ClientOnly>
      </button>

      <!-- Two-part star button: left = action, right = count badge -->
      <a v-if="!gallery.isLoading.value" href="https://github.com/mobinjavari/wallpapers" target="_blank"
        rel="noreferrer" title="Star this repo on GitHub"
        class="btn-press flex items-center h-8 rounded-xl border border-stroke text-xs font-semibold transition-all hover:border-accent/40 overflow-hidden">
        <span
          class="flex items-center gap-1.5 pl-2.5 pr-2 h-full text-fg-soft hover:bg-surface-muted transition-colors">
          <IconsGithubIcon class="w-3.5 h-3.5 shrink-0" />
        </span>
        <span v-if="gallery.starsCount.value > 0"
          class="flex items-center gap-1 pl-2 pr-2.5 h-full bg-surface-muted border-l border-stroke text-fg-muted">
          <IconsStarIcon class="w-4 h-4 text-amber-400 shrink-0" />
          <span class="tabular-nums">{{ gallery.starsCount.value.toLocaleString() }}</span>
        </span>
      </a>
    </div>
  </div>
</template>

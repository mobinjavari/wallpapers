<script setup lang="ts">
const gallery = useGallery()
</script>

<template>
  <!-- Wrapper always renders at a fixed height (h-5 inner rows) so the header
       doesn't shift as loading/error/loaded content swaps inside it. -->
  <div class="border-t border-stroke-faint">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar">
        <template v-if="gallery.isLoading.value">
          <div
            v-for="i in 5"
            :key="i"
            class="shrink-0 h-5 w-16 rounded-lg bg-slate-300 dark:bg-slate-600 animate-skeleton"
          />
        </template>

        <div
          v-else-if="gallery.hasError.value"
          class="h-5"
        />

        <template v-else>
          <a
            href="/"
            :class="[
              'shrink-0 h-5 px-2.5 flex items-center rounded-lg text-[11px] font-semibold transition-all',
              gallery.activeCategory.value === ''
                && !gallery.activeTags.value.length
                && !gallery.liveSearch.value
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'text-fg-muted hover:text-fg-strong hover:bg-surface-muted',
            ]"
            @click.prevent="gallery.setCategory('')"
          >
            <span>All</span>
            <span
              :class="[
                'ml-1',
                gallery.activeCategory.value === ''
                  && !gallery.activeTags.value.length
                  && !gallery.liveSearch.value
                  ? 'opacity-90'
                  : 'opacity-60',
              ]"
            >· {{ gallery.allItems.value.length }}</span>
          </a>

          <a
            v-for="cat in gallery.categories.value"
            :key="cat.name"
            :href="`/tag/${encodeURIComponent(cat.name)}`"
            :class="[
              'shrink-0 h-5 px-2.5 flex items-center rounded-lg text-[11px] font-semibold capitalize transition-all',
              gallery.activeCategory.value === cat.name
                ? 'bg-violet-600 text-white shadow-md shadow-accent/20'
                : 'text-fg-muted hover:text-fg-strong hover:bg-surface-muted',
            ]"
            @click.prevent="gallery.setCategory(cat.name)"
          >
            <span>{{ cat.name }}</span>
            <span
              :class="['ml-1', gallery.activeCategory.value === cat.name ? 'opacity-90' : 'opacity-60']"
            >· {{ cat.count }}</span>
          </a>
        </template>
      </div>
    </div>
  </div>
</template>

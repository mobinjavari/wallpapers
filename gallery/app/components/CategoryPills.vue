<script setup lang="ts">
const gallery = useGallery()
</script>

<template>
  <div v-if="!gallery.isLoading.value && !gallery.hasError.value" class="border-t border-stroke-faint">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar">
        <a href="/" :class="[
          'shrink-0 px-2.5 py-1 flex items-center rounded-lg text-[11px] font-semibold transition-all',
          gallery.activeCategory.value === '' &&
            !gallery.activeTags.value.length &&
            !gallery.liveSearch.value
            ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
            : 'text-fg-muted hover:text-fg-strong hover:bg-surface-muted',
        ]" @click.prevent="gallery.setCategory('')">
          <span>All</span>
          <span class="opacity-60 ml-1">· {{ gallery.allItems.value.length }}</span>
        </a>

        <a v-for="cat in gallery.categories.value" :key="cat.name" :href="`/tag/${encodeURIComponent(cat.name)}`"
          :class="[
            'shrink-0 px-2.5 py-1 flex items-center rounded-lg text-[11px] font-semibold capitalize transition-all',
            gallery.activeCategory.value === cat.name
              ? 'bg-violet-600 text-white shadow-md shadow-accent/20'
              : 'text-fg-muted hover:text-fg-strong hover:bg-surface-muted',
          ]" @click.prevent="gallery.setCategory(cat.name)">
          <span>{{ cat.name }}</span>
          <span class="opacity-60 ml-1">· {{ cat.count }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

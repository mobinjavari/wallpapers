<script setup lang="ts">
const gallery = useGallery()
</script>

<template>
  <div
    v-if="gallery.activeTags.value.length > 0 || gallery.liveSearch.value.trim()"
    class="flex items-center gap-2 mb-4 flex-wrap"
  >
    <span class="text-[11px] text-fg-faint shrink-0">Filtering:</span>

    <div
      v-if="gallery.liveSearch.value.trim()"
      class="inline-flex items-center gap-1 h-5 pl-2 pr-0.5 rounded-full bg-accent-surface text-accent-fg text-[11px] font-semibold"
    >
      <span>"{{ gallery.liveSearch.value }}"</span>
      <button
        class="w-4 h-4 flex items-center justify-center rounded-full hover:bg-accent-hover transition-colors btn-press"
        @click="gallery.setSearch('')"
      >
        <IconsClearIcon class="w-2.5 h-2.5" />
      </button>
    </div>

    <div
      v-for="tag in gallery.activeTags.value"
      :key="tag"
      class="inline-flex items-center gap-1 h-5 pl-2 pr-0.5 rounded-full bg-surface-muted border border-stroke text-fg-soft text-[11px] font-semibold"
    >
      <span>#{{ tag }}</span>
      <button
        class="w-4 h-4 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors btn-press"
        @click="gallery.removeTag(tag)"
      >
        <IconsClearIcon class="w-2.5 h-2.5" />
      </button>
    </div>

    <button
      class="text-[11px] font-semibold text-fg-faint hover:text-error transition-colors ml-auto"
      @click="gallery.resetAllFilters()"
    >
      Clear all
    </button>
  </div>
</template>

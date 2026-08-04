<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { weservUrl } from '~/utils/image'

const downloadModal = useDownloadModal()

const imgLoaded = ref(false)

// Reset shimmer whenever the active URL changes
watchEffect(() => {
  void downloadModal.activeUrl.value
  imgLoaded.value = false
})
</script>

<template>
  <div
    v-if="downloadModal.isOpen.value"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 dm-fade-in"
  >
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-backdrop backdrop-blur-sm"
      role="presentation"
      @click="downloadModal.close()"
    />

    <!-- Panel -->
    <div
      class="relative w-full sm:max-w-sm bg-surface-raised border border-stroke rounded-t-3xl sm:rounded-2xl shadow-2xl shadow-black/30 z-10 overflow-hidden dm-panel-in"
    >
      <!-- Handle bar (mobile) -->
      <div class="sm:hidden flex justify-center py-2">
        <div class="w-8 h-1 rounded-full bg-surface-hover" />
      </div>

      <!-- Preview with shimmer -->
      <div class="relative h-40 sm:h-44 overflow-hidden bg-surface-muted">
        <div
          class="absolute inset-0 dm-shimmer transition-opacity duration-300"
          :class="{ 'opacity-0': imgLoaded }"
        />
        <img
          :src="weservUrl(downloadModal.activeUrl.value, { w: 800, q: 82, output: 'webp' })"
          class="cinema-pan w-full h-full object-cover transition-opacity duration-300"
          :class="{ 'opacity-0': !imgLoaded, 'opacity-100': imgLoaded }"
          alt="Preview"
          @load="imgLoaded = true"
          @error="imgLoaded = true"
        >
        <div class="absolute inset-0 p-0 -m-2 bg-linear-to-t from-surface-raised via-transparent to-transparent" />
      </div>

      <!-- Body -->
      <div class="dm-body px-4 m-2">
        <div class="flex items-center gap-2 mb-4">
          <p class="text-sm font-bold text-fg truncate">
            {{ downloadModal.activeName.value }}
          </p>
          <span
            class="shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-accent-surface text-accent-fg uppercase tracking-wide"
          >
            {{ downloadModal.activeExt.value }}
          </span>
        </div>

        <div class="flex flex-col gap-2">
          <button
            class="btn-press w-full h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center justify-between transition-colors shadow-lg shadow-violet-500/20"
            @click="downloadModal.processCrop(0, 0)"
          >
            <span>Download Original</span>
            <span class="text-[10px] text-violet-200 font-extrabold uppercase">
              {{ downloadModal.activeExt.value }}
            </span>
          </button>

          <div class="grid grid-cols-2 gap-1.5">
            <button
              class="btn-press h-9 px-3 rounded-xl bg-surface-muted hover:bg-surface-hover text-fg-strong text-xs font-semibold flex items-center justify-between transition-colors border border-stroke"
              @click="downloadModal.processCrop(16, 9)"
            >
              <span>Desktop</span>
              <span class="text-fg-faint font-bold text-[10px]">16:9</span>
            </button>
            <button
              class="btn-press h-9 px-3 rounded-xl bg-surface-muted hover:bg-surface-hover text-fg-strong text-xs font-semibold flex items-center justify-between transition-colors border border-stroke"
              @click="downloadModal.processCrop(9, 16)"
            >
              <span>Mobile</span>
              <span class="text-fg-faint font-bold text-[10px]">9:16</span>
            </button>
            <button
              class="btn-press h-9 px-3 rounded-xl bg-surface-muted hover:bg-surface-hover text-fg-strong text-xs font-semibold flex items-center justify-between transition-colors border border-stroke"
              @click="downloadModal.processCrop(21, 9)"
            >
              <span>Ultrawide</span>
              <span class="text-fg-faint font-bold text-[10px]">21:9</span>
            </button>
            <button
              class="btn-press h-9 px-3 rounded-xl bg-surface-muted hover:bg-surface-hover text-fg-strong text-xs font-semibold flex items-center justify-between transition-colors border border-stroke"
              @click="downloadModal.processCrop(1, 1)"
            >
              <span>Square</span>
              <span class="text-fg-faint font-bold text-[10px]">1:1</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes cinemaPan {
  0% {
    transform: scale(1) translate(0, 0);
  }

  25% {
    transform: scale(1.07) translate(-1%, 0.8%);
  }

  50% {
    transform: scale(1.04) translate(0.8%, -0.5%);
  }

  75% {
    transform: scale(1.09) translate(-0.4%, -1%);
  }

  100% {
    transform: scale(1) translate(0, 0);
  }
}

.cinema-pan {
  animation: cinemaPan 18s ease-in-out infinite;
}

@keyframes dmShimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.dm-shimmer {
  background: linear-gradient(90deg,
      var(--color-surface-muted) 0%,
      var(--color-surface-hover) 50%,
      var(--color-surface-muted) 100%);
  background-size: 200% 100%;
  animation: dmShimmer 1.8s ease-in-out infinite;
}

.dm-fade-in {
  animation: dmFadeIn 250ms ease-out forwards;
}

.dm-panel-in {
  animation: dmPanelIn 300ms ease-out forwards;
}

@keyframes dmFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes dmPanelIn {
  from {
    opacity: 0;
    transform: translateY(1.5rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 640px) {
  .dm-panel-in {
    animation: dmPanelInSm 300ms ease-out forwards;
  }

  @keyframes dmPanelInSm {
    from {
      opacity: 0;
      transform: scale(0.95);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }
}

.dm-body {
  padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
}

@media (min-width: 640px) {
  .dm-body {
    padding-bottom: 1.25rem;
  }
}
</style>

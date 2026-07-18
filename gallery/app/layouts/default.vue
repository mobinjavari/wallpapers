<script setup lang="ts">
import { onMounted, onUnmounted, watchEffect, computed } from 'vue'
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, SITE_NAME } from '~/utils/seo'

const gallery = useGallery()
const lightbox = useLightbox()
const theme = useTheme()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const siteUrl = computed(() => (config.public.siteUrl as string || '').replace(/\/$/, ''))
const canonicalUrl = computed(() =>
  siteUrl.value ? `${siteUrl.value}${route.path}${route.fullPath.slice(route.path.length)}` : '',
)

useSeoMeta({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  ogType: 'website',
  ogImage: () => (siteUrl.value ? `${siteUrl.value}/share.png` : undefined),
  ogUrl: () => canonicalUrl.value || undefined,
  ogSiteName: SITE_NAME,
  twitterCard: 'summary_large_image',
  twitterTitle: DEFAULT_TITLE,
  twitterDescription: DEFAULT_DESCRIPTION,
  twitterImage: () => (siteUrl.value ? `${siteUrl.value}/share.png` : undefined),
})

useHead({
  link: [{ rel: 'canonical', href: () => canonicalUrl.value || undefined }],
})

// Detect lightbox close to handle URL navigation
let _lightboxWasOpen = false
watchEffect(() => {
  const isOpen = lightbox.isOpen.value
  if (!isOpen && _lightboxWasOpen) {
    gallery.handleLightboxClose()
  }
  _lightboxWasOpen = isOpen
})

// Update URL when lightbox navigates prev/next (shallow, no router event)
let _prevLightboxIndex = -1
watchEffect(() => {
  if (!lightbox.isOpen.value) {
    _prevLightboxIndex = -1
    return
  }
  const idx = lightbox.currentIndex.value
  if (_prevLightboxIndex >= 0 && idx !== _prevLightboxIndex) {
    const item = lightbox.items.value[idx]
    if (item) history.replaceState(null, '', '/wallpaper/' + encodeURIComponent(item.name))
  }
  _prevLightboxIndex = idx
})

// Sync state on browser back/forward (popstate detection)
let _isPopstate = false
const handlePopstate = () => {
  _isPopstate = true
}

router.afterEach((to) => {
  if (_isPopstate && !gallery.isLoading.value) {
    const q = (to.query.q as string) ?? ''
    gallery.syncToUrl(String(to.name ?? ''), to.params as Record<string, string>, q)
  }
  _isPopstate = false
})

onMounted(() => {
  window.addEventListener('popstate', handlePopstate)
  gallery.init()
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopstate)
})
</script>

<template>
  <div :class="{ dark: theme.isDark.value }">
    <div class="bg-pattern bg-surface text-fg transition-colors duration-300 min-h-screen flex flex-col">
      <header
        class="sticky top-0 z-40 bg-header backdrop-blur-xl border-b border-stroke transition-colors duration-300 pt-safe"
      >
        <AppHeader />
        <CategoryPills />
      </header>

      <main class="grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-5">
        <FilterChips />
        <GalleryGrid />
      </main>

      <Lightbox />
      <DownloadModal />
      <ToastContainer />
      <ScrollToTopButton />
    </div>

    <!-- Route-specific pages inject meta only; no visible UI -->
    <div style="display: none">
      <slot />
    </div>
  </div>
</template>

import { ref, computed } from 'vue'
import type { WallpaperItem, Category } from '~/types/wallpaper'

const ITEMS_PER_PAGE = 20

// Module-level singleton state — SSR-safe because server always renders
// the loading skeleton (isLoading=true, allItems=[]) and never calls init().
const allItems = ref<WallpaperItem[]>([])
const liveSearch = ref('')
const activeTags = ref<string[]>([])
const activeCategory = ref('')
const isLoading = ref(true)
const hasError = ref(false)
const starsCount = ref(0)
const currentPage = ref(0)
const visibleItems = ref<WallpaperItem[]>([])
let _pushedWallpaper = false
let _searchTimer: ReturnType<typeof setTimeout> | null = null

const categories = computed<Category[]>(() => {
  const counts: Record<string, number> = {}
  for (const item of allItems.value) {
    for (const tag of item.hashtags) {
      counts[tag] = (counts[tag] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))
})

const filteredItems = computed<WallpaperItem[]>(() => {
  const q = liveSearch.value.trim().toLowerCase()
  return allItems.value.filter((item) => {
    const matchText =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.hashtags.some((t) => t.toLowerCase().includes(q))
    const matchTags =
      !activeTags.value.length ||
      activeTags.value.every((at) => item.hashtags.some((t) => t.toLowerCase() === at))
    return matchText && matchTags
  })
})

const hasMore = computed(
  () => currentPage.value * ITEMS_PER_PAGE < filteredItems.value.length,
)

export function useGallery() {
  const router = useRouter()
  const route = useRoute()
  const lightbox = useLightbox()
  const toast = useToast()

  function renderBatch() {
    const start = currentPage.value * ITEMS_PER_PAGE
    const chunk = filteredItems.value.slice(start, start + ITEMS_PER_PAGE)
    visibleItems.value = [...visibleItems.value, ...chunk]
    currentPage.value++
  }

  function resetAndRenderBatch() {
    currentPage.value = 0
    visibleItems.value = []
    const chunk = filteredItems.value.slice(0, ITEMS_PER_PAGE)
    visibleItems.value = [...chunk]
    currentPage.value = 1
  }

  function _findAndOpenLightbox(name: string, fullscreen = false) {
    const item = allItems.value.find((i) => i.name === name)
    if (!item) return false
    const idx = filteredItems.value.findIndex((f) => f.rawUrl === item.rawUrl)
    const i = idx >= 0 ? idx : 0
    if (fullscreen) lightbox.openInFullscreen(filteredItems.value, i)
    else lightbox.open(filteredItems.value, i)
    return true
  }

  async function init() {
    isLoading.value = true
    hasError.value = false

    try {
      const [wallpapersRes, starsRes] = await Promise.all([
        $fetch<{ wallpapers: WallpaperItem[] }>('/api/wallpapers'),
        $fetch<{ count: number }>('/api/stars').catch(() => ({ count: 0 })),
      ])

      allItems.value = wallpapersRes.wallpapers
      starsCount.value = starsRes.count
      isLoading.value = false

      const routeName = String(route.name ?? '')
      const params = route.params as Record<string, string>
      const q = (route.query.q as string) ?? ''

      if (routeName === 'wallpaper-name') {
        const name = decodeURIComponent(params.name ?? '')
        const found = _findAndOpenLightbox(name)
        if (!found) await navigateTo('/')
        if (q) liveSearch.value = q
      } else if (routeName === 'tag-tag') {
        const t = decodeURIComponent(params.tag ?? '').toLowerCase()
        liveSearch.value = q
        activeTags.value = [t]
        activeCategory.value = t
      } else if (routeName === 'index' && q) {
        liveSearch.value = q
      }
    } catch (err) {
      console.error('Gallery load error:', err)
      isLoading.value = false
      hasError.value = true
    }
  }

  function syncToUrl(routeName: string, params: Record<string, string>, q: string) {
    switch (routeName) {
      case 'index':
        if (lightbox.isOpen.value) lightbox.close()
        liveSearch.value = q
        activeTags.value = []
        activeCategory.value = ''
        break
      case 'tag-tag': {
        if (lightbox.isOpen.value) lightbox.close()
        const t = decodeURIComponent(params.tag ?? '').toLowerCase()
        liveSearch.value = q
        activeTags.value = [t]
        activeCategory.value = t
        break
      }
      case 'wallpaper-name': {
        const name = decodeURIComponent(params.name ?? '')
        if (!lightbox.isOpen.value) {
          _findAndOpenLightbox(name)
        }
        break
      }
    }
  }

  function handleLightboxClose() {
    const routeName = String(route.name ?? '')
    if (routeName !== 'wallpaper-name') {
      _pushedWallpaper = false
      return
    }
    if (_pushedWallpaper) {
      _pushedWallpaper = false
      history.back()
    } else {
      navigateTo('/', { replace: true })
    }
  }

  function setSearch(value: string) {
    liveSearch.value = value
    if (_searchTimer) clearTimeout(_searchTimer)
    _searchTimer = setTimeout(async () => {
      _searchTimer = null
      const q = value.trim()
      if (activeTags.value.length === 1) {
        const base = `/tag/${encodeURIComponent(activeTags.value[0] ?? '')}`
        await navigateTo(q ? `${base}?q=${encodeURIComponent(q)}` : base, { replace: true })
      } else {
        await navigateTo(q ? `/?q=${encodeURIComponent(q)}` : '/', { replace: true })
      }
    }, 400)
  }

  async function setCategory(name: string) {
    activeCategory.value = name
    activeTags.value = name ? [name] : []
    const q = liveSearch.value.trim()
    const base = name ? '/tag/' + encodeURIComponent(name) : '/'
    await navigateTo(q ? `${base}?q=${encodeURIComponent(q)}` : base)
  }

  async function triggerTagSearch(tag: string) {
    const t = tag.trim().toLowerCase()
    if (!t || activeTags.value.includes(t)) return
    activeTags.value = [...activeTags.value, t]
    activeCategory.value = t
    if (activeTags.value.length === 1) {
      await navigateTo('/tag/' + encodeURIComponent(t))
    }
  }

  async function removeTag(tag: string) {
    activeTags.value = activeTags.value.filter((t) => t !== tag)
    if (activeCategory.value === tag) activeCategory.value = activeTags.value[0] ?? ''
    if (activeTags.value.length === 0) {
      await navigateTo(
        liveSearch.value ? `/?q=${encodeURIComponent(liveSearch.value)}` : '/',
        { replace: true },
      )
    } else if (activeTags.value.length === 1) {
      const base = `/tag/${encodeURIComponent(activeTags.value[0] ?? '')}`
      await navigateTo(
        liveSearch.value ? `${base}?q=${encodeURIComponent(liveSearch.value)}` : base,
        { replace: true },
      )
    }
  }

  async function resetAllFilters() {
    if (_searchTimer) {
      clearTimeout(_searchTimer)
      _searchTimer = null
    }
    liveSearch.value = ''
    activeTags.value = []
    activeCategory.value = ''
    await navigateTo('/')
  }

  async function openLightbox(visibleIndex: number) {
    const item = visibleItems.value[visibleIndex]
    if (!item) return
    const index = filteredItems.value.findIndex((f) => f.rawUrl === item.rawUrl)
    _pushedWallpaper = true
    await navigateTo('/wallpaper/' + encodeURIComponent(item.name))
    lightbox.open(filteredItems.value, index >= 0 ? index : visibleIndex)
  }

  function copyShareLink(item: WallpaperItem) {
    const url = `${location.origin}/wallpaper/${encodeURIComponent(item.name)}`
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => toast.show({ msg: 'Link copied!', type: 'ok' }))
        .catch(() => toast.show({ msg: 'Copy failed', type: 'err' }))
    } else {
      try {
        const el = Object.assign(document.createElement('textarea'), { value: url })
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        toast.show({ msg: 'Link copied!', type: 'ok' })
      } catch {
        toast.show({ msg: 'Copy failed', type: 'err' })
      }
    }
  }

  return {
    allItems,
    liveSearch,
    activeTags,
    activeCategory,
    isLoading,
    hasError,
    starsCount,
    visibleItems,
    categories,
    filteredItems,
    hasMore,
    init,
    syncToUrl,
    handleLightboxClose,
    renderBatch,
    resetAndRenderBatch,
    setSearch,
    setCategory,
    triggerTagSearch,
    removeTag,
    resetAllFilters,
    openLightbox,
    copyShareLink,
  }
}

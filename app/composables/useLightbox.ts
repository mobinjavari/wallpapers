import { ref, computed } from 'vue'
import type { WallpaperItem } from '~/types/wallpaper'

const isOpen = ref(false)
const items = ref<WallpaperItem[]>([])
const currentIndex = ref(0)
const imgSrc = ref('')
const imgAlt = ref('')
const imgLoading = ref(true)
const pendingFullscreen = ref(false)
let _closeCleanupTimer: ReturnType<typeof setTimeout> | null = null

const total = computed(() => items.value.length)
const canPrev = computed(() => currentIndex.value > 0)
const canNext = computed(() => currentIndex.value < items.value.length - 1)
const currentItem = computed<WallpaperItem | undefined>(() => items.value[currentIndex.value])

function loadImage() {
  const item = items.value[currentIndex.value]
  if (!item) return
  imgLoading.value = true
  imgSrc.value = ''
  setTimeout(() => {
    imgSrc.value = item.rawUrl
    imgAlt.value = item.name
  }, 0)
}

export function useLightbox() {
  // Reopening before the previous close()'s cleanup timer fires must cancel
  // it — otherwise it later wipes the freshly opened imgSrc/items out from
  // under the new session.
  function cancelCloseCleanup() {
    if (_closeCleanupTimer) {
      clearTimeout(_closeCleanupTimer)
      _closeCleanupTimer = null
    }
  }

  function open(newItems: WallpaperItem[], index: number) {
    cancelCloseCleanup()
    items.value = newItems
    currentIndex.value = index
    loadImage()
    isOpen.value = true
    document.body.classList.add('overflow-hidden')
  }

  function openInFullscreen(newItems: WallpaperItem[], index: number) {
    cancelCloseCleanup()
    items.value = newItems
    currentIndex.value = index
    loadImage()
    isOpen.value = true
    pendingFullscreen.value = true
    document.body.classList.add('overflow-hidden')
  }

  function clearPendingFullscreen() {
    pendingFullscreen.value = false
  }

  function close() {
    isOpen.value = false
    pendingFullscreen.value = false
    document.body.classList.remove('overflow-hidden')
    cancelCloseCleanup()
    _closeCleanupTimer = setTimeout(() => {
      _closeCleanupTimer = null
      imgSrc.value = ''
      items.value = []
    }, 300)
  }

  function prev() {
    if (canPrev.value) {
      currentIndex.value--
      loadImage()
    }
  }

  function next() {
    if (canNext.value) {
      currentIndex.value++
      loadImage()
    }
  }

  function onImageLoad() {
    imgLoading.value = false
  }

  function onImageError() {
    imgLoading.value = false
  }

  return {
    isOpen,
    items,
    currentIndex,
    imgSrc,
    imgAlt,
    imgLoading,
    pendingFullscreen,
    total,
    canPrev,
    canNext,
    currentItem,
    open,
    openInFullscreen,
    clearPendingFullscreen,
    close,
    prev,
    next,
    onImageLoad,
    onImageError,
  }
}

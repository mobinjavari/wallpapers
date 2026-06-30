import type { WallpaperDetail, WallpaperAuthor } from '~/types/wallpaper'

interface DetailSnapshot {
  author: WallpaperAuthor | null
  lastModified: string | null
}

// Module-level cache — persists for the lifetime of the page session.
// Both caches keyed by wallpaper name.
const cache = new Map<string, DetailSnapshot>()
const inflight = new Map<string, Promise<DetailSnapshot | null>>()

export function useWallpaperDetail() {
  async function fetchDetail(name: string): Promise<DetailSnapshot | null> {
    if (cache.has(name)) return cache.get(name)!

    // Deduplicate concurrent callers for the same wallpaper.
    if (inflight.has(name)) return inflight.get(name)!

    const promise = $fetch<{ wallpaper: WallpaperDetail }>(
      `/api/wallpapers/${encodeURIComponent(name)}`,
    )
      .then((res): DetailSnapshot => {
        const snap: DetailSnapshot = {
          author: res.wallpaper.author ?? null,
          lastModified: res.wallpaper.lastModified ?? null,
        }
        cache.set(name, snap)
        return snap
      })
      .catch((): null => {
        cache.set(name, { author: null, lastModified: null })
        return null
      })
      .finally(() => {
        inflight.delete(name)
      })

    inflight.set(name, promise)
    return promise
  }

  return { fetchDetail }
}

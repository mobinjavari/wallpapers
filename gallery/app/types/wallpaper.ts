export interface WallpaperMeta {
  name: string
  ext: string
  hashtags: string[]
  rawUrl: string
  size: number
  path: string
  oid: string
  createdAt: string | null
}

export interface WallpaperAuthor {
  /** Git commit author name (always present) */
  name: string
  /** GitHub login — null if the committer has no linked GitHub account */
  login: string | null
  /** GitHub avatar URL */
  avatarUrl: string | null
  /** GitHub profile URL */
  profileUrl: string | null
}

export interface WallpaperDetail extends WallpaperMeta {
  lastModified: string | null
  author: WallpaperAuthor | null
}

export type WallpaperItem = WallpaperMeta

export interface Category {
  name: string
  count: number
}

export interface PageMeta {
  title: string
  description: string
  ogType?: 'website' | 'article'
  ogImage?: string
  ogUrl?: string
  ogImageWidth?: number
  ogImageHeight?: number
}

export interface ToastItem {
  id: number
  msg: string
  type: 'ok' | 'err'
  leaving: boolean
}

export interface DownloadModalPayload {
  url: string
  name: string
  ext: string
}

export type ThemeMode = 'auto' | 'light' | 'dark'

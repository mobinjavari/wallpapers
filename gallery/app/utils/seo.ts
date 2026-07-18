import type { PageMeta } from '~/types/wallpaper'

export const SITE_NAME = 'Wallpapers Gallery'
export const DEFAULT_TITLE = `${SITE_NAME} — Curated Minimalist & Aesthetic Collection`
export const DEFAULT_DESCRIPTION
  = 'A curated gallery of premium, minimalist, and aesthetic high-resolution wallpapers. Download 4K desktop and mobile backgrounds synced directly from GitHub.'

export function buildDefaultMeta(siteUrl: string, canonicalUrl?: string): PageMeta {
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    ogType: 'website',
    ogImage: siteUrl ? `${siteUrl}/share.png` : undefined,
    ogUrl: canonicalUrl || undefined,
  }
}

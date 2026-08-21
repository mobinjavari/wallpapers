<script setup lang="ts">
import type { WallpaperDetail } from '~/types/wallpaper'
import { SITE_NAME } from '~/utils/seo'
import { weservUrl } from '~/utils/image'
import { humanizeWallpaperName, safeDecodeURIComponent } from '~/utils/format'

const route = useRoute()
const config = useRuntimeConfig()

const name = safeDecodeURIComponent(route.params.name as string)

const { data: result, error } = await useAsyncData(`wallpaper-${name}`, () =>
  $fetch<{ wallpaper: WallpaperDetail }>(`/api/wallpapers/${encodeURIComponent(name)}`),
)

if (error.value || !result.value?.wallpaper) {
  throw createError({ statusCode: 404, message: `Wallpaper "${name}" not found`, fatal: true })
}

const w = result.value.wallpaper
const requestUrl = useRequestURL()
const siteUrl = ((config.public.siteUrl as string) || requestUrl.origin).replace(/\/$/, '')

const displayName = computed(() => humanizeWallpaperName(w.name))

const description = [
  `Download ${displayName.value}`,
  w.ext !== 'img' ? `(${w.ext.toUpperCase()})` : '',
  w.hashtags.length > 0 ? `· ${w.hashtags.map(t => `#${t}`).join(' ')}` : '',
  '— free high-resolution wallpaper.',
]
  .filter(Boolean)
  .join(' ')

const ogImage = w.rawUrl
  ? weservUrl(w.rawUrl, { w: 1200, h: 630, fit: 'cover', output: 'jpg', q: 85 })
  : `${siteUrl}/share.png`

useSeoMeta({
  title: `${displayName.value} — ${SITE_NAME}`,
  description,
  ogType: 'article',
  ogSiteName: SITE_NAME,
  ogImage,
  ogUrl: `${siteUrl}/wallpaper/${encodeURIComponent(w.name)}`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterTitle: `${displayName.value} — ${SITE_NAME}`,
  twitterDescription: description,
  twitterImage: ogImage,
})

const imageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ImageObject',
  'name': displayName.value,
  'description': description,
  'contentUrl': w.rawUrl,
  'thumbnailUrl': ogImage,
  'url': `${siteUrl}/wallpaper/${encodeURIComponent(w.name)}`,
  'encodingFormat': `image/${w.ext === 'jpg' ? 'jpeg' : w.ext}`,
  'keywords': w.hashtags.join(', ') || undefined,
  'uploadDate': w.createdAt ?? undefined,
  'dateModified': w.lastModified ?? undefined,
  'creator': w.author
    ? { '@type': 'Person', 'name': w.author.name, 'url': w.author.profileUrl ?? undefined }
    : undefined,
}

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/wallpaper/${encodeURIComponent(w.name)}` }],
  // type="application/ld+json" scripts aren't executable script, so CSP's script-src never gates them.
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(imageSchema) }],
})
</script>

<template>
  <div />
</template>

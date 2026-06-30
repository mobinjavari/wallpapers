<script setup lang="ts">
import type { WallpaperDetail } from '~/types/wallpaper'
import { SITE_NAME } from '~/utils/seo'
import { weservUrl } from '~/utils/image'

const route = useRoute()
const config = useRuntimeConfig()

const name = decodeURIComponent(route.params.name as string)

const { data: result, error } = await useAsyncData(`wallpaper-${name}`, () =>
  $fetch<{ wallpaper: WallpaperDetail }>(`/api/wallpapers/${encodeURIComponent(name)}`),
)

if (error.value || !result.value?.wallpaper) {
  throw createError({ statusCode: 404, message: `Wallpaper "${name}" not found`, fatal: true })
}

const w = result.value.wallpaper
const requestUrl = useRequestURL()
const siteUrl = ((config.public.siteUrl as string) || requestUrl.origin).replace(/\/$/, '')

const description = [
  `Download ${w.name}`,
  w.ext !== 'img' ? `(${w.ext.toUpperCase()})` : '',
  w.hashtags.length > 0 ? `· ${w.hashtags.map((t) => `#${t}`).join(' ')}` : '',
  '— free high-resolution wallpaper.',
]
  .filter(Boolean)
  .join(' ')

const ogImage = w.rawUrl
  ? weservUrl(w.rawUrl, { w: 1200, h: 630, fit: 'cover', output: 'jpg', q: 85 })
  : `${siteUrl}/share.png`

useSeoMeta({
  title: `${w.name} — ${SITE_NAME}`,
  description,
  ogType: 'article',
  ogSiteName: SITE_NAME,
  ogImage,
  ogUrl: `${siteUrl}/wallpaper/${encodeURIComponent(w.name)}`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterTitle: `${w.name} — ${SITE_NAME}`,
  twitterDescription: description,
  twitterImage: ogImage,
})

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/wallpaper/${encodeURIComponent(w.name)}` }],
})
</script>

<template>
  <div />
</template>

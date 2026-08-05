<script setup lang="ts">
import { SITE_NAME, DEFAULT_DESCRIPTION } from '~/utils/seo'
import { safeDecodeURIComponent } from '~/utils/format'

const route = useRoute()
const config = useRuntimeConfig()

const tag = safeDecodeURIComponent(route.params.tag as string)
const siteUrl = ((config.public.siteUrl as string) || '').replace(/\/$/, '')
const canonicalUrl = siteUrl ? `${siteUrl}/tag/${encodeURIComponent(tag)}` : undefined
const description = `Browse and download ${tag} wallpapers. High-resolution minimalist ${tag} backgrounds for desktop and mobile. ${DEFAULT_DESCRIPTION}`

useSeoMeta({
  title: `#${tag} Wallpapers — ${SITE_NAME}`,
  description,
  ogType: 'website',
  ogSiteName: SITE_NAME,
  ogImage: siteUrl ? `${siteUrl}/share.png` : undefined,
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: `#${tag} — ${SITE_NAME}`,
  twitterDescription: description,
  twitterImage: siteUrl ? `${siteUrl}/share.png` : undefined,
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})
</script>

<template>
  <div />
</template>

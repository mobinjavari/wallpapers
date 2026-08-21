function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function urlEntry(loc: string, lastmod?: string | null): string {
  const lastmodTag = lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''
  return `<url><loc>${xmlEscape(loc)}</loc>${lastmodTag}</url>`
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')

  const { public: { siteUrl: rawSiteUrl } } = useRuntimeConfig()
  const siteUrl = (rawSiteUrl as string || '').replace(/\/$/, '')
  const wallpapers = await fetchWallpapers().catch((err) => {
    console.error('[sitemap] Failed to fetch wallpapers:', err instanceof Error ? err.message : err)
    return []
  })

  const tags = new Set<string>()
  for (const item of wallpapers) {
    for (const tag of item.hashtags) tags.add(tag)
  }

  const urls = [
    urlEntry(`${siteUrl}/`),
    ...[...tags].sort().map(tag => urlEntry(`${siteUrl}/tag/${encodeURIComponent(tag)}`)),
    ...wallpapers.map(item => urlEntry(`${siteUrl}/wallpaper/${encodeURIComponent(item.name)}`, item.createdAt)),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`
})

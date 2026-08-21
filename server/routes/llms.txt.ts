import { SITE_NAME, DEFAULT_DESCRIPTION } from '../../app/utils/seo'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')

  const { public: { siteUrl: rawSiteUrl } } = useRuntimeConfig()
  const siteUrl = (rawSiteUrl as string || '').replace(/\/$/, '')
  const wallpapers = await fetchWallpapers().catch((err) => {
    console.error('[llms.txt] Failed to fetch wallpapers:', err instanceof Error ? err.message : err)
    return []
  })

  const tags = new Set<string>()
  for (const item of wallpapers) {
    for (const tag of item.hashtags) tags.add(tag)
  }

  const categoryLinks = [...tags]
    .sort()
    .map(tag => `- [#${tag}](${siteUrl}/tag/${encodeURIComponent(tag)}): Browse ${tag} wallpapers.`)
    .join('\n')
  const categoriesSection = categoryLinks ? `\n## Categories\n\n${categoryLinks}\n` : ''

  return `# ${SITE_NAME}

> ${DEFAULT_DESCRIPTION}

## Pages

- [Home](${siteUrl}/): The full wallpaper gallery, browsable and searchable.
${categoriesSection}
## API

- [Wallpaper list](${siteUrl}/api/wallpapers): JSON listing of every wallpaper (name, tags, size, raw image URL).
`
})

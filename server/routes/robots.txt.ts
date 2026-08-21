export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  if (process.env.NODE_ENV !== 'production') {
    return 'User-agent: *\nDisallow: /\n'
  }

  const { public: { siteUrl } } = useRuntimeConfig()
  const lines = ['User-agent: *', 'Disallow:']
  if (siteUrl) lines.push(`Sitemap: ${(siteUrl as string).replace(/\/$/, '')}/sitemap.xml`)
  return lines.join('\n') + '\n'
})

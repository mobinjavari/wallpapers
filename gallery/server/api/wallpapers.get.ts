export default defineEventHandler(async (event) => {
  try {
    const wallpapers = await fetchWallpapers()
    setResponseHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
    return { wallpapers }
  }
  catch (err) {
    console.error('Failed to fetch wallpapers from GitHub:', err)
    throw createError({ statusCode: 502, message: 'Failed to fetch wallpapers' })
  }
})

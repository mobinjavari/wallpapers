export default defineEventHandler(async (event) => {
  try {
    const name = decodeURIComponent(getRouterParam(event, 'name') ?? '')
    const wallpaper = await fetchWallpaperByName(name)
    if (!wallpaper) {
      throw createError({ statusCode: 404, message: 'Wallpaper not found' })
    }
    return { wallpaper }
  } catch (err) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    console.error('Failed to fetch wallpaper:', err)
    throw createError({ statusCode: 502, message: 'Failed to fetch wallpaper' })
  }
})

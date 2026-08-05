export default defineEventHandler(async (event) => {
  const rawName = getRouterParam(event, 'name') ?? ''
  // Malformed percent-encoding (e.g. a stray "%") falls through as the raw
  // value, which simply won't match a wallpaper — the same 404 an unknown
  // name gets, rather than a decode crash surfacing as a 502.
  let name = rawName
  try {
    name = decodeURIComponent(rawName)
  }
  catch {
    // keep rawName
  }

  try {
    const wallpaper = await fetchWallpaperByName(name)
    if (!wallpaper) {
      throw createError({ statusCode: 404, message: 'Wallpaper not found' })
    }
    return { wallpaper }
  }
  catch (err) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    console.error('Failed to fetch wallpaper:', err)
    throw createError({ statusCode: 502, message: 'Failed to fetch wallpaper' })
  }
})

export default defineEventHandler(async (event) => {
  try {
    const count = await fetchStarCount()
    setResponseHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
    return { count }
  }
  catch {
    return { count: 0 }
  }
})

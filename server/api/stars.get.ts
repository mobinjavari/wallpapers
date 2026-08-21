export default defineEventHandler(async (event) => {
  // fetchStarCount() already catches and logs internally, always resolving — never rejects.
  const count = await fetchStarCount()
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
  return { count }
})

export function humanizeWallpaperName(name: string): string {
  const cleaned = name
    .replace(/[-_+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return cleaned
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

// Route params can carry malformed percent-encoding (e.g. a stray "%").
// Falls back to the raw value instead of throwing, so a bad URL degrades to
// "not found" further down the pipeline rather than crashing navigation.
export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

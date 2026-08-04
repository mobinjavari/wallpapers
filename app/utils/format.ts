export function humanizeWallpaperName(name: string): string {
  const cleaned = name
    .replace(/[-_+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return cleaned
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

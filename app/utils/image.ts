interface WeservOptions {
  w?: number
  h?: number
  q?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  output?: 'jpg' | 'webp' | 'png' | 'avif' | 'gif'
}

export function weservUrl(imageUrl: string, options: WeservOptions = {}): string {
  const parts: string[] = [`url=${encodeURIComponent(imageUrl)}`]
  if (options.w !== undefined) parts.push(`w=${options.w}`)
  if (options.h !== undefined) parts.push(`h=${options.h}`)
  if (options.q !== undefined) parts.push(`q=${options.q}`)
  if (options.fit !== undefined) parts.push(`fit=${options.fit}`)
  if (options.output !== undefined) parts.push(`output=${options.output}`)
  return `https://images.weserv.nl/?${parts.join('&')}`
}

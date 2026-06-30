export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exp
  return `${exp === 0 ? value : value.toFixed(1)} ${units[exp]}`
}

export async function cropAndDownload(
  imageUrl: string,
  fileName: string,
  aspectX: number,
  aspectY: number,
  showToast: (msg: string, type: 'ok' | 'err') => void,
): Promise<void> {
  try {
    if (aspectX === 0 && aspectY === 0) {
      // Original: direct fetch → blob download, preserves source format
      const res = await fetch(imageUrl)
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      const ext = (imageUrl.split('.').pop() ?? 'jpg').split('?')[0]!.toLowerCase()
      const url = URL.createObjectURL(blob)
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `${fileName}.${ext}`,
      })
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('Download started!', 'ok')
      return
    }

    // Cropped: canvas → PNG
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.crossOrigin = 'anonymous'
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Image load failed'))
      i.src = imageUrl
    })

    const ow = img.naturalWidth
    const oh = img.naturalHeight
    let tw = ow
    let th = ow * (aspectY / aspectX)

    if (th > oh) {
      th = oh
      tw = oh * (aspectX / aspectY)
    }

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(tw)
    canvas.height = Math.round(th)
    canvas
      .getContext('2d')!
      .drawImage(img, (ow - tw) / 2, (oh - th) / 2, tw, th, 0, 0, tw, th)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `${fileName}_${aspectX}x${aspectY}.png`,
      })
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('Download started!', 'ok')
    }, 'image/png')
  } catch (err) {
    console.error('Download error:', err)
    showToast('Download failed. Try again.', 'err')
  }
}

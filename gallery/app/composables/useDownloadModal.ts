import { ref } from 'vue'
import { cropAndDownload } from '~/utils/download'
import type { DownloadModalPayload } from '~/types/wallpaper'

const isOpen = ref(false)
const activeUrl = ref('')
const activeName = ref('')
const activeExt = ref('')

export function useDownloadModal() {
  const toast = useToast()

  function open({ url, name, ext }: DownloadModalPayload) {
    activeUrl.value = url
    activeName.value = name
    activeExt.value = ext
    isOpen.value = true
    document.body.classList.add('overflow-hidden')
  }

  function close() {
    isOpen.value = false
    document.body.classList.remove('overflow-hidden')
  }

  function processCrop(x: number, y: number) {
    cropAndDownload(activeUrl.value, activeName.value, x, y, (msg, type) =>
      toast.show({ msg, type }),
    )
    close()
  }

  return {
    isOpen,
    activeUrl,
    activeName,
    activeExt,
    open,
    close,
    processCrop,
  }
}

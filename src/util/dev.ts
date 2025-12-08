export const isMobile = /Mobi|Android/i.test(navigator.userAgent)
export const isTouch = 'ontouchstart' in window
export const isMac = /Macintosh/.test(navigator.userAgent)

export const sleep = async (duration: number) => new Promise((res) => setTimeout(res, duration))

export async function copyText(text: string) {
  await sleep(0)
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // continue to fallback
    }
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'absolute'
  textArea.style.left = '-9999px'
  document.body.appendChild(textArea)

  const selection = document.getSelection()
  const selectedRange = selection?.rangeCount ? selection.getRangeAt(0) : null

  textArea.select()
  const copied = document.execCommand('copy')

  document.body.removeChild(textArea)
  if (selectedRange && selection) {
    selection.removeAllRanges()
    selection.addRange(selectedRange)
  }

  if (!copied) {
    window.prompt('Copy to clipboard: Cmd/Ctrl+C, then Enter', text)
  }
}

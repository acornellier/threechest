export const isMobile = /Mobi|Android/i.test(navigator.userAgent)
export const isTouch = 'ontouchstart' in window
export const isMac = /Macintosh/.test(navigator.userAgent)

export const sleep = async (duration: number) => new Promise((res) => setTimeout(res, duration))

export async function copyText(text: string) {
  // sleep(0) hack for Safari
  await sleep(0)
  // noinspection ES6MissingAwait
  navigator.clipboard.writeText(text)
}

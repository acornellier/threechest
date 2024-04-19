export const isMobile = /Mobi|Android/i.test(navigator.userAgent)
export const isTouch = 'ontouchstart' in window
export const isMac = /Macintosh/.test(navigator.userAgent)

export const sleep = async (duration: number) => new Promise((res) => setTimeout(res, duration))

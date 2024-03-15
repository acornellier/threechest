export const isDev = process.env.NODE_ENV === 'development'

export const isMobile = /Mobi|Android/i.test(navigator.userAgent)

export const isMac = /Macintosh/.test(navigator.userAgent)

export const sleep = async (duration: number) => new Promise((res) => setTimeout(res, duration))

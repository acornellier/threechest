export const isDev = process.env.NODE_ENV === 'development'

export const isMobile = /Mobi|Android/i.test(navigator.userAgent)

export const isMac = /Macintosh/.test(navigator.userAgent)

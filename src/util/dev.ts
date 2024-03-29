export const isDev = process.env.NODE_ENV === 'development'

export const isMobile = /Mobi|Android/i.test(navigator.userAgent)
export const isTouch = 'ontouchstart' in window
export const isMac = /Macintosh/.test(navigator.userAgent)

export const sleep = async (duration: number) => new Promise((res) => setTimeout(res, duration))

export function isDeepEqual(object1: Record<string, unknown>, object2: Record<string, unknown>) {
  const objKeys1 = Object.keys(object1)
  const objKeys2 = Object.keys(object2)

  if (objKeys1.length !== objKeys2.length) return false

  for (const key of objKeys1) {
    const value1 = object1[key]
    const value2 = object2[key]

    const isObjects = isObject(value1) && isObject(value2)

    if (
      (isObjects &&
        !isDeepEqual(value1 as Record<string, unknown>, value2 as Record<string, unknown>)) ||
      (!isObjects && value1 !== value2)
    ) {
      return false
    }
  }
  return true
}

const isObject = (object: unknown) => object != null && typeof object === 'object'

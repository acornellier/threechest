export function uniqBy<T extends Record<string, any>, U extends keyof T>(array: T[], fields: U[]) {
  return array.filter(
    (item, i, newArray) =>
      newArray.findIndex((otherItem) =>
        fields.every((field) => item[field] === otherItem[field]),
      ) === i,
  )
}

export const sum = (numbers: number[]) => numbers.reduce((acc, cur) => acc + cur, 0)
export const average = (numbers: number[]) => sum(numbers) / numbers.length

export function mapBy<T extends object>(array: T[], field: keyof T) {
  return array.reduce(
    (acc, item) => {
      acc[item[field] as number] = item
      return acc
    },
    {} as Record<number, T>,
  )
}

export function groupBy<K extends PropertyKey, T>(array: T[], by: keyof T | ((item: T) => K)) {
  return array.reduce(
    (acc, item) => {
      const key = typeof by === 'function' ? by(item) : (item[by] as K)
      acc[key] ??= []
      acc[key]!.push(item)
      return acc
    },
    {} as Record<K, T[]>,
  )
}

export function tally<K extends PropertyKey, T>(arr: T[], keySelector: (item: T) => K) {
  return Object.entries(groupBy(arr, keySelector)).reduce(
    (acc, [id, items]) => {
      acc[id as K] = (items as T[]).length
      return acc
    },
    {} as Record<K, number>,
  )
}

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

export function shuffle<T>(prevArray: T[]) {
  const array = [...prevArray]
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j]!, array[i]!]
  }
  return array
}

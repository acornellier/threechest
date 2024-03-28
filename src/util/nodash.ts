import { Point } from '../data/types.ts'

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
export const averagePoint = (points: Point[]): Point => [
  average(points.map((point) => point[0])),
  average(points.map((point) => point[1])),
]

export function tally<K extends PropertyKey, T>(
  arr: T[],
  keySelector: (item: T, index: number) => K,
) {
  return Object.entries(Object.groupBy(arr, keySelector)).reduce(
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

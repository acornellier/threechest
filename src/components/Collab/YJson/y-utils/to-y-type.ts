import * as Y from 'yjs'
import type { YJson } from '../index.ts'
import type {
  Json,
  JsonArray,
  JsonObject} from '../../Json';
import {
  assertIsJsonArray,
  assertIsJsonObject,
  assertIsJsonPrimitive,
  assertIsPlainObject,
  isJsonPrimitive,
  isPlainArray,
  isPlainObject
} from '../../Json'

export function objectToYMap(object: JsonObject): Y.Map<YJson> {
  const yMap = new Y.Map<YJson>()

  assertIsPlainObject(object)
  Object.entries(object).forEach(([property, val]) => {
    if (Array.isArray(val)) {
      assertIsJsonArray(val)
      yMap.set(property, arrayToYArray(val))
    } else if (isPlainObject(val)) {
      yMap.set(property, objectToYMap(val))
    } else {
      assertIsJsonPrimitive(val)
      yMap.set(property, val)
    }
  })

  return yMap
}

export function arrayToYArray(array: JsonArray): Y.Array<YJson> {
  const yArray = new Y.Array<YJson>()

  array.forEach((val) => {
    if (Array.isArray(val)) {
      yArray.push([arrayToYArray(val)])
    } else if (isPlainObject(val)) {
      yArray.push([objectToYMap(val)])
    } else {
      assertIsJsonPrimitive(val)
      yArray.push([val])
    }
  })

  return yArray
}

export function toYType(value: Json): Y.Map<YJson> | Y.Array<YJson> {
  if (isPlainArray(value)) return arrayToYArray(value)
  if (isPlainObject(value)) return objectToYMap(value)

  throw new Error(`Unsupported type. Type: ${typeof value}, value ${JSON.stringify(value)}`)
}

export function unknownToYTypeOrPrimitive(value: unknown): YJson {
  if (isJsonPrimitive(value)) return value

  if (isPlainArray(value)) {
    assertIsJsonArray(value)
    return arrayToYArray(value)
  }

  if (isPlainObject(value)) {
    assertIsJsonObject(value)
    return objectToYMap(value)
  }

  throw new Error(`Unsupported type. Type: ${typeof value}, value ${JSON.stringify(value)}`)
}

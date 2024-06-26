export * from './create-types.ts'
export * from './to-y-type.ts'
export * from './transact.ts'
import type * as Y from 'yjs'
import { isYArray } from '../assertions.ts'

export function isEmpty(yType: Y.Map<any> | Y.Array<any>): boolean {
  if (isYArray(yType)) {
    return yType.length === 0
  }
  return yType.size === 0
}

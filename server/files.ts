import * as path from 'path'
import { isProd } from '../src/util/isDev.ts'

export function getDirname(file: string) {
  const dirname = new URL('.', file).pathname
  return path.sep === '\\' ? dirname.slice(1) : dirname
}

const dirname = getDirname(import.meta.url)
export const cacheFolder = isProd ? '/tmp/cache' : path.join(dirname, 'cache')

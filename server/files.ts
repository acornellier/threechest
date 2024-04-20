import * as path from 'path'

export function getDirname(file: string) {
  const dirname = new URL('.', file).pathname
  return path.sep === '\\' ? dirname.slice(1) : dirname
}

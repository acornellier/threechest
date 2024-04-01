import { fileURLToPath } from 'url'
import path from 'path'

export function getDirname(file: string) {
  const __filename = fileURLToPath(file)
  return path.dirname(__filename)
}

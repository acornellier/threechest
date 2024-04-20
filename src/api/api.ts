import { isDev } from '../util/isDev.ts'

export const apiBaseUrl = isDev ? 'http://localhost:6173/api' : '/api'

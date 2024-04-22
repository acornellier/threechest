import DotenvFlow from 'dotenv-flow'
import fs from 'fs'
import { cacheFolder } from './files.ts'
import * as path from 'node:path'
import { isDev } from '../src/util/isDev.ts'

if (isDev) DotenvFlow.config()

const tokenPath = `${cacheFolder}/wclToken.json`

const tokenUrl = 'https://www.warcraftlogs.com/oauth/token'
const clientId = process.env.WCL_CLIENT_ID
const clientSecret = process.env.WCL_CLIENT_SECRET

interface OAuthResult {
  access_token: string
  expires_in: number
  error?: string
  error_description?: string
}

interface TokenData {
  token: string
  expiry: number
}

let data: TokenData | null = null

export async function getWclToken() {
  if (data === null && fs.existsSync(tokenPath)) {
    data = JSON.parse(fs.readFileSync(tokenPath).toString()) as TokenData
  }

  if (data && Date.now() / 1000 < data.expiry) {
    return data.token
  }

  console.log('fetching new token')
  const headers = new Headers()
  headers.set('Authorization', 'Basic ' + btoa(clientId + ':' + clientSecret))
  headers.set('Content-Type', 'application/x-www-form-urlencoded')

  const fetchRes = await fetch(tokenUrl, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers,
  })

  const res: OAuthResult = await fetchRes.json()
  if (res.error) {
    throw new Error(`${res.error_description}: ${res.error}`)
  }

  data = {
    token: res.access_token,
    expiry: Date.now() / 1000 + res.expires_in,
  }

  fs.mkdirSync(path.dirname(tokenPath), { recursive: true })
  fs.writeFileSync(tokenPath, JSON.stringify(data))
  return data.token
}

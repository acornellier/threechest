import DotenvFlow from 'dotenv-flow'
import NodeCache from 'node-cache'

DotenvFlow.config()

const myCache = new NodeCache()

const tokenUrl = 'https://www.warcraftlogs.com/oauth/token'
const clientId = process.env.WCL_CLIENT_ID
const clientSecret = process.env.WCL_CLIENT_SECRET

interface OAuthResult {
  access_token: string
  expires_in: number
  error?: string
  error_description?: string
}

export async function getWclToken() {
  const token = myCache.get('wcl_token')
  if (token) return token

  console.log('fetching new token')
  const headers = new Headers()
  headers.set('Authorization', 'Basic ' + btoa(clientId + ':' + clientSecret))
  headers.set('Content-Type', 'application/x-www-form-urlencoded')

  const res = await fetch(tokenUrl, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers,
  })

  const data: OAuthResult = await res.json()
  if (data.error) {
    throw new Error(`${data.error_description}: ${data.error}`)
  }

  myCache.set('wcl_token', data.access_token, data.expires_in)
  return data.access_token
}

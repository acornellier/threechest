import dotenv from 'dotenv-flow'

dotenv.config()

const tokenUrl = 'https://www.warcraftlogs.com/oauth/token'
const clientId = process.env.WCL_CLIENT_ID
const clientSecret = process.env.WCL_CLIENT_SECRET

let token: string | null = null

export async function getWclToken() {
  if (token) return token

  const headers = new Headers()
  headers.set('Authorization', 'Basic ' + btoa(clientId + ':' + clientSecret))
  headers.set('Content-Type', 'application/x-www-form-urlencoded')

  const res = await fetch(tokenUrl, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers,
  })

  const data: { access_token: string; expires_in: number } = await res.json()

  token = data.access_token
  return token
}

import parser from 'node-wow-lua-codec'

export class DecodingError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DecodingError'
  }
}

export async function decodeRoute(str) {
  try {
    return await parser.decode(str.trim())
  } catch (err) {
    throw new DecodingError('Invalid MDT string')
  }
}

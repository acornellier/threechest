import parser from 'node-weakauras-parser'

export class DecodingError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DecodingError'
  }
}

async function decode(str) {
  try {
    return await parser.decode(str.trim())
  } catch (err) {
    throw new DecodingError('Invalid MDT string')
  }
}

export async function importRoute(str) {
  return await decode(str)
}

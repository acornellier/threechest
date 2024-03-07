import parser from 'node-weakauras-parser'

export async function encodeRoute(mdtRoute) {
  return await parser.encode(mdtRoute)
}

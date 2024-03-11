import parser from 'node-wow-lua-codec'

export async function encodeRoute(mdtRoute) {
  return await parser.encode(mdtRoute)
}

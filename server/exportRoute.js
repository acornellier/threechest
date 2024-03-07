import parser from 'node-weakauras-parser'

export async function exportRoute(mdtRoute) {
  return await parser.encode(mdtRoute)
}

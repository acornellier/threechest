import { decodeRoute } from '../server/decodeRoute.js'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import path from 'path'
import { sampleRoutesDefinitions } from '../src/data/sampleRoutes/sampleRoutesDefinitions.ts'
import { SampleRoute } from '../src/util/types.ts'
import { mdtRouteToRoute } from '../src/util/mdtUtil.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

for (const [dungeonKey, routes] of Object.entries(sampleRoutesDefinitions)) {
  const folder = `${__dirname}/../src/data/sampleRoutes/${dungeonKey}`
  await fs.rm(folder, { recursive: true, force: true })
  await fs.mkdir(folder)

  for (const { affix, difficulty, name, mdt } of routes) {
    const mdtRoute = await decodeRoute(mdt)
    const route = mdtRouteToRoute(mdtRoute)

    if (name) route.name = name

    const sampleRoute: SampleRoute = {
      affix,
      difficulty,
      route,
    }

    const file = `${folder}/${route.uid}.json`
    await fs.writeFile(file, JSON.stringify(sampleRoute))
  }
}

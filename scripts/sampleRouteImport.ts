import { decodeRoute } from '../server/decodeRoute.js'
import fs from 'fs/promises'
import { sampleRoutesDefinitions } from '../src/data/sampleRoutes/sampleRoutesDefinitions.ts'
import { SampleRoute } from '../src/util/types.ts'
import { mdtRouteToRoute } from '../src/util/mdtUtil.ts'
import { getDirname } from '../server/files.ts'

const dirname = getDirname(import.meta.url)

for (const [dungeonKey, routes] of Object.entries(sampleRoutesDefinitions)) {
  const folder = `${dirname}/../src/data/sampleRoutes/${dungeonKey}`
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

import { mapBoundsUncompiled } from '../src/data/coordinates/mapBoundsUncompiled.ts'
import { getDirname } from '../server/files.ts'
import fs from 'fs'
import * as path from 'path'

const output = `import type { MapBoundsByUiMapId } from './mapBoundsUncompiled.ts'

export const mapBounds: MapBoundsByUiMapId = ${JSON.stringify(mapBoundsUncompiled)}
`

const dirname = getDirname(import.meta.url)
fs.writeFileSync(path.join(dirname, '../src/data/coordinates/mapBounds.ts'), output)

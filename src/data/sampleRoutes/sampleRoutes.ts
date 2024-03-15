import { MdtRoute } from '../../util/types.ts'

const modules = {
  eb: import.meta.glob(`./eb/*.json`, { eager: true }),
}

function importSampleRoutes(dungeonKey: 'eb') {
  return Object.values(modules[dungeonKey]).map((mod) => (mod as { default: MdtRoute }).default)
}

export const sampleRoutes: MdtRoute[] = importSampleRoutes('eb')

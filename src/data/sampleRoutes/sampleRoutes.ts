import type { SampleRoutes } from './sampleRoutesUncompiled.ts'
import type { TopRoutes } from '../../../server/topRoutesUncompiled.ts'

export const topRoutes = import.meta.compileTime<TopRoutes>('./topRoutesUncompiled.ts')

export const sampleRoutes = import.meta.compileTime<SampleRoutes>('./sampleRoutesUncompiled.ts')

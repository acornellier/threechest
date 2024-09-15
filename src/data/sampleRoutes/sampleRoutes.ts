import type { SampleRoutes } from './sampleRoutesUncompiled.ts'

export const sampleRoutes = import.meta.compileTime<SampleRoutes>('./sampleRoutesUncompiled.ts')

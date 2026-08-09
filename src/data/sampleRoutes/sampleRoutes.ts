import type { SampleRoutes } from './sampleRoutesUncompiled.ts'

/** Hand-curated "easy" routes only. Ranked routes come from src/api/rankingsApi.ts at runtime. */
export const easySampleRoutes = import.meta.compileTime<SampleRoutes>('./sampleRoutesUncompiled.ts')

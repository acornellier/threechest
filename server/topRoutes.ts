import type { TopRoutes } from './topRoutesUncompiled.ts'

export const topRoutes = import.meta.compileTime<TopRoutes>(`./topRoutesUncompiled.ts`)

import type { MapBoundsByUiMapId } from './mapBoundsUncompiled.ts'

const compiledMapBounds = import.meta.compileTime<MapBoundsByUiMapId>('./mapBoundsUncompiled.ts')

export const mapBounds = compiledMapBounds as MapBoundsByUiMapId

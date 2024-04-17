import type { MdtRoute } from '../src/util/types'

declare function decodeRoute(str: string): Promise<MdtRoute>

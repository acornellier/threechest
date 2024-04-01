import { getWclRoute } from '../../server/wclRoute.ts'
import { wclTestData } from '../../src/util/wclTestData.ts'

await getWclRoute(wclTestData.code, wclTestData.fightId)

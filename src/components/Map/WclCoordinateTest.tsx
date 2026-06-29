import { Rectangle, Tooltip } from 'react-leaflet'
import { type WclPoint, wclPointToLeafletPoint, type WclResult } from '../../util/wclCalc.ts'
import { useCallback, useEffect, useState } from 'react'
import { useRoute } from '../../store/routes/routeHooks.ts'
import { useLocalStorage } from '../../util/hooks/useLocalStorage.ts'
import { useShortcut } from '../../util/hooks/useShortcut.ts'
import { importWclRoute } from '../../store/reducers/importReducer.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'

const rectSize = 2

export function WclCoordinateTest() {
  const route = useRoute()
  const [wclResult, setWclResult] = useState<WclResult | null>(null)
  const dispatch = useAppDispatch()

  const [shown, setShown] = useLocalStorage('wcl-coordinate-test-shown', false)
  const onShortcut = useCallback(() => setShown((prev) => !prev), [setShown])
  useShortcut('w', onShortcut)

  const onRecalculate = useCallback(() => {
    if (route.wclUrlInfo) dispatch(importWclRoute({ wclUrlInfo: route.wclUrlInfo }))
  }, [dispatch, route.wclUrlInfo])
  useShortcut('r', onRecalculate)

  useEffect(() => {
    if (!route.wclUrlInfo) {
      setWclResult(null)
      return
    }
    try {
      const { code, fightId } = route.wclUrlInfo
      import(`../../../server/cache/wclRoute/${code}-${fightId}.json`)
        .then((res: WclResult) => {
          setWclResult(res)
        })
        .catch((_) => setWclResult(null))
    } catch (_) {
      setWclResult(null)
    }
  }, [route.wclUrlInfo])

  if (!shown || !wclResult) return null

  return wclResult.events
    .filter((point) => point.x && point.y && point.mapID)
    .map((event, idx) => {
      // if (idx > 40) return null
      const point = wclPointToLeafletPoint(event as WclPoint, wclResult.deathEvents)
      return (
        <Rectangle
          key={Math.random()}
          bounds={[
            [point[0] - rectSize, point[1] - rectSize],
            [point[0] + rectSize, point[1] + rectSize],
          ]}
          color="red"
          fillOpacity={1}
          fillColor="blue"
        >
          <Tooltip className={`pull-number-tooltip [&]:text-lg`} direction="center" permanent>
            {idx + 1}
            {/* <span className="-mr-9 text-xs">{event.timestamp}</span>*/}
          </Tooltip>
        </Rectangle>
      )
    })
}

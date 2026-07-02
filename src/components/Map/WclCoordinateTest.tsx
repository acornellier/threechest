import { Popup, Rectangle, Tooltip } from 'react-leaflet'
import {
  passes,
  wclEventKey,
  type WclEventTrace,
  type WclPoint,
  wclPointToLeafletPoint,
  wclResultToRoute,
  type WclResult,
  type WclTrace,
} from '../../util/wclCalc.ts'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRoute } from '../../store/routes/routeHooks.ts'
import { useLocalStorage } from '../../util/hooks/useLocalStorage.ts'
import { useShortcut } from '../../util/hooks/useShortcut.ts'
import { wclRouteApi } from '../../api/wclRouteApi.ts'
import { setPulls } from '../../store/routes/routesReducer.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { mapBounds } from '../../data/coordinates/mapBounds.ts'
import type { Shortcut } from '../../data/shortcuts.ts'
import { darkenColor, getPullColor } from '../../util/colors.ts'

const rectSize = 2

const recalcShortcut: Shortcut[] = [{ key: 'r' }]

type EventStyle = { color: string; fillColor: string; fillOpacity: number }

function eventStyle(entry: WclEventTrace | undefined): EventStyle {
  if (entry?.status === 'assigned' && entry.pullIdx !== undefined && entry.pullIdx >= 0) {
    const pullColor = getPullColor(entry.pullIdx)
    return { color: darkenColor(pullColor, 80), fillColor: pullColor, fillOpacity: 0.9 }
  }

  switch (entry?.status) {
    case 'alt':
      // Kept as a map-seam alternate — the matcher may place the mob here instead.
      return { color: '#eab308', fillColor: '#eab308', fillOpacity: 0.45 }
    case 'duplicate':
      return { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.25 }
    case 'no-death':
      return { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25 }
    case 'untracked':
      return { color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.25 }
    default:
      // In a pull but not (yet) claimed by any pass — stands out white while stepping passes.
      return { color: '#666666', fillColor: '#ffffff', fillOpacity: 0.9 }
  }
}

function statusText(entry: WclEventTrace | undefined, maxPasses: number | undefined): string {
  switch (entry?.status) {
    case 'assigned':
      return entry.pullIdx! >= 0
        ? `Pull ${entry.pullIdx! + 1} — ${entry.passName}`
        : `Dropped pull — ${entry.passName}`
    case 'alt':
      return 'Map-seam alternate — offered to the matcher'
    case 'duplicate':
      return 'Discarded — losing map-seam candidate'
    case 'no-death':
      return 'Ignored — no death recorded'
    case 'untracked':
      return 'Ignored — mob not in dungeon data'
    default:
      return maxPasses !== undefined
        ? `Unassigned after ${passes[maxPasses - 1]?.name ?? `pass ${maxPasses}`}`
        : 'Unassigned'
  }
}

export function WclCoordinateTest() {
  const route = useRoute()
  const [wclResult, setWclResult] = useState<WclResult | null>(null)
  const dispatch = useAppDispatch()

  const [shown, setShown] = useLocalStorage('wcl-coordinate-test-shown', false)
  const onShortcut = useCallback(() => setShown((prev) => !prev), [setShown])
  useShortcut('w', onShortcut)

  const [maxPasses, setMaxPasses] = useState<number | undefined>(undefined)
  const recalculate = useCallback(
    async (maxPasses?: number) => {
      if (maxPasses !== undefined) {
        console.log('pass', maxPasses, passes[maxPasses - 1]?.name)
      }
      if (!route.wclUrlInfo) return
      const { result } = await wclRouteApi(route.wclUrlInfo)
      const { route: recalculatedRoute } = wclResultToRoute(result, maxPasses)
      dispatch(setPulls(recalculatedRoute.pulls))
    },
    [dispatch, route.wclUrlInfo],
  )

  const onRecalculate = useCallback(() => {
    setMaxPasses(undefined)
    recalculate()
  }, [recalculate])
  useShortcut(recalcShortcut, onRecalculate)

  const nextPass = useCallback(() => {
    const newMaxPasses = (maxPasses ?? 0) + 1
    setMaxPasses(newMaxPasses)
    recalculate(newMaxPasses)
  }, [recalculate, maxPasses])
  useShortcut('l', nextPass)

  const resetPasses = useCallback(() => {
    setMaxPasses(1)
    recalculate(1)
  }, [recalculate])
  useShortcut('n', resetPasses)

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

  // What wclCalc did with each event: assigned pull + pass, or why it was discarded.
  const trace = useMemo(() => {
    if (!wclResult || !shown) {
      return null
    }
    const trace: WclTrace = new Map()
    try {
      wclResultToRoute(wclResult, maxPasses, trace)
    } catch (_) {
      return null
    }
    return trace
  }, [wclResult, shown, maxPasses])

  if (!shown || !wclResult) return null

  const visibleEvents = wclResult.events.filter(
    (point) => point.x && point.y && point.mapID && mapBounds[point.mapID],
  )

  const startTime = visibleEvents[0]?.timestamp ?? 0

  return visibleEvents.map((event, idx) => {
    // if (idx > 40) return null
    const point = wclPointToLeafletPoint(event as WclPoint, wclResult.deathEvents)
    const entry = trace?.get(wclEventKey(event))
    const style = eventStyle(entry)
    return (
      <Rectangle
        key={`${wclEventKey(event)}-${idx}`}
        bounds={[
          [point[0] - rectSize, point[1] - rectSize],
          [point[0] + rectSize, point[1] + rectSize],
        ]}
        pathOptions={{
          ...style,
          weight: 2,
          // Dashed border: the event's position was ignored (mis-mapped or outlier).
          dashArray: entry?.posDropped ? '3 3' : undefined,
        }}
      >
        <Tooltip className={`pull-number-tooltip [&]:text-lg`} direction="center" permanent>
          {idx + 1}
          {/* <span className="-mr-9 text-xs">{event.timestamp}</span>*/}
        </Tooltip>
        <Popup className="plain-popup" closeButton={false}>
          <div className="relative flex flex-col text-white rounded-sm">
            <div className="absolute w-full h-full bg-slate-800 opacity-85 -z-10 rounded-sm" />
            <div className="p-2 rounded-sm">
              <div>
                <span className="font-bold">{event.name}</span>
                {` | Event ${idx + 1}`}
              </div>
              <div>
                Id: {event.gameId} | Instance: {event.instanceId ?? '-'} | Map: {event.mapID}
              </div>
              <div>Time: +{((event.timestamp - startTime) / 1000).toFixed(1)}s</div>
              <div>
                <span style={{ color: style.fillColor }}>{statusText(entry, maxPasses)}</span>
              </div>
              {entry?.posDropped && (
                <div style={{ fontSize: 10 }}>
                  [Position ignored:{' '}
                  {entry.posDropped === 'far-from-spawn' ? 'far from any spawn' : 'pull outlier'}]
                </div>
              )}
            </div>
          </div>
        </Popup>
      </Rectangle>
    )
  })
}

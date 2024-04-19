import { memo, useCallback, useMemo } from 'react'
import type { Drawing, Drawing as DrawingType } from '../../../util/types.ts'
import { Polyline, useMap } from 'react-leaflet'
import { Arrowhead } from './Arrowhead.tsx'
import { useMapObjectsHidden } from '../../../store/reducers/mapReducer.ts'
import { useAppDispatch, useRootSelector } from '../../../store/storeUtil.ts'
import { deleteDrawing, updateDrawing } from '../../../store/routes/routesReducer.ts'
import type { Point } from '../../../data/types.ts'
import type { LatLng} from 'leaflet';
import { type LeafletEventHandlerFnMap } from 'leaflet'
import { latLngToPoint } from '../../../util/map.ts'

interface Props {
  drawing: DrawingType
}

const overDrawingClass = 'over-drawing'

function isOnLine(point: number, lineStart: number, lineEnd: number, width: number) {
  const min = Math.min(lineStart, lineEnd) - width
  const max = Math.max(lineStart, lineEnd) + width
  return point > min && point < max
}

function splitDrawingAtPoint(drawing: Drawing, point: Point, mapZoom: number): Drawing | null {
  if (drawing.positions.length <= 0) return null

  let lineIndex = 0
  let posIndex = 1
  let solved = false
  const width = drawing.weight / mapZoom / 4

  for (; lineIndex < drawing.positions.length; ++lineIndex) {
    const line = drawing.positions[lineIndex]!
    if (line.length <= 1) continue

    for (posIndex = 1; posIndex < line.length; ++posIndex) {
      const prevPos = line[posIndex - 1]!
      const curPos = line[posIndex]!

      if (
        isOnLine(point[0], prevPos[0], curPos[0], width) &&
        isOnLine(point[1], prevPos[1], curPos[1], width)
      ) {
        solved = true
        break
      }
    }

    if (solved) break
  }

  if (!solved) return null

  const line1 = drawing.positions[lineIndex]!.slice(0, posIndex - 1)
  const line2 = drawing.positions[lineIndex]!.slice(posIndex + 1)

  const newPositions = [...drawing.positions]

  newPositions.splice(lineIndex, 1)
  if (line2.length > 0) newPositions.splice(lineIndex, 0, line2)
  if (line1.length > 0) newPositions.splice(lineIndex, 0, line1)

  return {
    ...drawing,
    positions: newPositions,
  }
}

function DrawingComponent({ drawing }: Props) {
  const dispatch = useAppDispatch()
  const map = useMap()
  const hidden = useMapObjectsHidden()
  const drawMode = useRootSelector((state) => state.map.drawMode)
  const isErasing = useRootSelector((state) => state.map.isErasing)

  const eraseAtPoint = useCallback(
    (latLng: LatLng) => {
      const newDrawing = splitDrawingAtPoint(drawing, latLngToPoint(latLng), map.getZoom())
      if (newDrawing) {
        if (newDrawing.positions.every((line) => line.length <= 0))
          dispatch(deleteDrawing(newDrawing))
        else dispatch(updateDrawing(newDrawing))
      }
    },
    [dispatch, drawing, map],
  )

  const eventHandlers: LeafletEventHandlerFnMap = useMemo(() => {
    return {
      click: (e) => {
        if (drawMode === 'deleting') {
          dispatch(deleteDrawing(drawing))
          map.getContainer().classList.remove(overDrawingClass)
        } else if (drawMode === 'erasing') {
          eraseAtPoint(e.latlng)
        }
      },
      mouseover: () => {
        map.getContainer().classList.add(overDrawingClass)
      },
      mouseout: () => map.getContainer().classList.remove(overDrawingClass),
      mousemove: (e) => {
        if (isErasing) {
          eraseAtPoint(e.latlng)
        }
      },
    }
  }, [dispatch, drawMode, drawing, map, isErasing, eraseAtPoint])

  return (
    <>
      <Polyline
        key={`${hidden}`}
        className="fade-in-map-object"
        positions={drawing.positions}
        color={drawing.color}
        weight={drawing.weight}
        opacity={hidden ? 0 : 1}
        fillOpacity={0}
        interactive
        eventHandlers={eventHandlers}
      />
      <Arrowhead drawing={drawing} hidden={hidden} />
    </>
  )
}

export const DrawingMemo = memo(DrawingComponent)

import { useCallback } from 'react'
import { generateColorWheel } from '../Collab/colorWheel.ts'
import { rgbToHex } from '../../util/colors.ts'

export const useColorWheelCanvas = (onChangeColor: (color: string) => void) =>
  useCallback(
    (colorWheel: HTMLCanvasElement) => {
      if (!colorWheel) return

      generateColorWheel(colorWheel, 250, 1)

      const onMouseEvent = (e: MouseEvent) => {
        if (!e.which) return
        const ctx = colorWheel.getContext('2d')
        if (!ctx) return
        const data = ctx.getImageData(e.offsetX, e.offsetY, 1, 1)
        const [r, g, b] = data.data.slice(0, 3) as unknown as [number, number, number]
        const color = rgbToHex(r, g, b)
        onChangeColor(color)
      }

      colorWheel.onmousedown = onMouseEvent
      colorWheel.onmousemove = onMouseEvent
    },
    [onChangeColor],
  )

import { Modal } from '../Common/Modal.tsx'
import { useAppDispatch, useSavedCollabColor, useSavedCollabName } from '../../store/hooks.ts'
import { setCollabColor, setCollabName } from '../../store/reducers/collabReducer.ts'
import { generateSlug } from 'random-word-slugs'
import { useCallback } from 'react'
import { generateColorWheel } from './colorWheel.ts'
import { rgbToHex } from '../../util/colors.ts'
import { Button } from '../Common/Button.tsx'
import { TooltipStyled } from '../Common/TooltipStyled.tsx'

interface Props {
  onClose: () => void
}

const generateCollabName = () => generateSlug(2, { format: 'title' })

export function CollabSettings({ onClose }: Props) {
  const dispatch = useAppDispatch()
  const [savedName, setSavedName] = useSavedCollabName()
  const [savedColor, setSavedColor] = useSavedCollabColor()

  const onChangeName = (newName: string) => {
    setSavedName(newName)
    dispatch(setCollabName(newName || generateCollabName()))
  }

  const onChangeColor = useCallback(
    (newColor: string) => {
      setSavedColor(newColor)
      dispatch(setCollabColor(newColor))
    },
    [dispatch, setSavedColor],
  )

  const canvasRef = useCallback(
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

  return (
    <Modal title="Collab settings" onClose={onClose} closeOnEscape closeOnClickOutside>
      <div className="flex flex-col gap-2">
        <div>
          Name
          <div className="flex gap-2">
            <input
              className="fancy w-full rounded-md"
              placeholder="<Random>"
              onChange={(e) => onChangeName(e.target.value)}
              value={savedName}
            />
            <Button short onClick={() => onChangeName('')}>
              Reset
            </Button>
          </div>
        </div>
        <div>
          Color
          <div className="flex gap-2">
            <div
              className="min-h-10 flex-1 flex items-center rounded-md cursor-pointer p-2 text-gray-400 text-[15px] "
              style={{ backgroundColor: savedColor || 'rgb(78, 78, 87)' }}
              data-tooltip-id="collab-color-canvas-tooltip"
            >
              {savedColor === '' ? '<Random>' : ''}
            </div>
            <Button short onClick={() => onChangeColor('')}>
              Reset
            </Button>
          </div>
          <TooltipStyled
            id="collab-color-canvas-tooltip"
            openOnClick
            closeEvents={{ click: true }}
            clickable
            place="bottom"
          >
            <canvas ref={canvasRef} />
          </TooltipStyled>
        </div>
      </div>
    </Modal>
  )
}

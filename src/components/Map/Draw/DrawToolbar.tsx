import { Button } from '../../Common/Button.tsx'
import { PaintBrushIcon } from '@heroicons/react/24/solid'
import { useAppDispatch, useRootSelector } from '../../../store/storeUtil.ts'
import {
  setDrawColor,
  setDrawMode,
  setDrawWeight,
  setMapMode,
} from '../../../store/reducers/mapReducer.ts'
import { clearDrawings } from '../../../store/routes/routesReducer.ts'
import { useCallback, useState } from 'react'
import { keyText, shortcuts } from '../../../data/shortcuts.ts'
import { useShortcut } from '../../../util/hooks/useShortcut.ts'
import { Dropdown, DropdownOption } from '../../Common/Dropdown.tsx'
import { WeightIcon } from '../../Common/Icons/WeightIcon.tsx'
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ColorGrid } from '../../Common/ColorGrid.tsx'
import { TooltipStyled } from '../../Common/TooltipStyled.tsx'
import { ClearIcon } from '../../Common/Icons/ClearIcon.tsx'
import { isTouch } from '../../../util/dev.ts'

type WeightOption = DropdownOption & { weight: number }

const weightToOption = (weight: number): WeightOption => ({
  id: weight.toString(),
  content: `${weight}`,
  weight,
})

const weightOptions: WeightOption[] = [1, 2, 3, 4, 8, 12, 16, 24].map(weightToOption)

export function DrawToolbar() {
  const dispatch = useAppDispatch()
  const { mapMode, drawMode, drawColor, drawWeight } = useRootSelector((state) => state.map)
  const [isChoosingColor, setChoosingColor] = useState(false)

  const isDrawing = mapMode === 'drawing'
  const toggleDraw = useCallback(
    () => dispatch(setMapMode(isDrawing ? 'editing' : 'drawing')),
    [dispatch, isDrawing],
  )
  useShortcut(shortcuts.draw, toggleDraw)

  const onChangeColor = useCallback(
    (newColor: string) => {
      setChoosingColor(false)
      dispatch(setDrawColor(newColor))
    },
    [dispatch],
  )

  if (isTouch) return

  const isDeleting = drawMode === 'deleting'
  const isErasing = drawMode === 'erasing'

  return (
    <div className="flex items-start gap-2 h-full">
      <Button
        twoDimensional={isDrawing}
        color={isDrawing ? 'green' : 'red'}
        Icon={PaintBrushIcon}
        onClick={toggleDraw}
        justifyStart
        tooltip={`Draw (${keyText(shortcuts.draw[0]!)})`}
        tooltipId="draw-tooltip"
      />
      {isDrawing && (
        <div className="flex items-start gap-6 h-full">
          <div className="flex items-start gap-2 h-full">
            <Button
              onClick={() => setChoosingColor((val) => !val)}
              justifyStart
              tooltip={`Line color`}
              tooltipId="draw-color-tooltip"
            >
              <div
                className="rounded-sm"
                style={{ backgroundColor: drawColor, width: 20, height: 20 }}
              />
            </Button>
            <TooltipStyled
              id="draw-color-tooltip"
              isOpen={isChoosingColor}
              clickable
              place="bottom"
              padding={8}
            >
              <ColorGrid onSelectColor={onChangeColor} />
            </TooltipStyled>
            <Dropdown
              buttonContent={<WeightIcon width={24} height={24} />}
              options={weightOptions}
              selected={weightToOption(drawWeight)}
              onSelect={(option) => dispatch(setDrawWeight(option.weight))}
              hideArrow
              tooltip="Line weight"
              tooltipId="draw-weight-tooltip"
            />
          </div>
          <div className="flex items-start gap-2 h-full">
            <Button
              twoDimensional={isErasing}
              color={isErasing ? 'green' : 'red'}
              Icon={ClearIcon}
              onClick={() => dispatch(setDrawMode(isErasing ? 'drawing' : 'erasing'))}
              tooltip={`Erase parts of drawings`}
              tooltipId="erase-drawings-tooltip"
            />
            <Button
              twoDimensional={isDeleting}
              color={isDeleting ? 'green' : 'red'}
              Icon={XMarkIcon}
              onClick={() => dispatch(setDrawMode(isDeleting ? 'drawing' : 'deleting'))}
              tooltip={`Delete individual drawings`}
              tooltipId="delete-drawings-tooltip"
            />
            <Button
              Icon={TrashIcon}
              onClick={() => dispatch(clearDrawings())}
              tooltip={`Clear ALL drawings`}
              tooltipId="clear-drawings-tooltip"
            />
          </div>
        </div>
      )}
    </div>
  )
}

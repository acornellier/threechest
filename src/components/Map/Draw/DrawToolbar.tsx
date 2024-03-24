import { Button } from '../../Common/Button.tsx'
import { PaintBrushIcon } from '@heroicons/react/24/solid'
import { useAppDispatch, useRootSelector } from '../../../store/storeUtil.ts'
import { setDrawColor, setDrawWeight, setIsDrawing } from '../../../store/reducers/mapReducer.ts'
import { clearDrawings } from '../../../store/routes/routesReducer.ts'
import { ClearIcon } from '../../Common/Icons/ClearIcon.tsx'
import { useCallback, useState } from 'react'
import { DrawColorWheel } from './DrawColorWheel.tsx'
import { keyText, shortcuts } from '../../../data/shortcuts.ts'
import { useShortcut } from '../../../hooks/useShortcut.ts'
import { Dropdown, DropdownOption } from '../../Common/Dropdown.tsx'
import { WeightIcon } from '../../Common/Icons/WeightIcon.tsx'

type WeightOption = DropdownOption & { weight: number }

const weightToOption = (weight: number): WeightOption => ({
  id: weight.toString(),
  content: `${weight}`,
  weight,
})

const weightOptions: WeightOption[] = [1, 2, 3, 4, 8, 12, 16, 24].map(weightToOption)

export function DrawToolbar() {
  const dispatch = useAppDispatch()
  const { isDrawing, drawColor, drawWeight } = useRootSelector((state) => state.map)
  const [isChoosingColor, setChoosingColor] = useState(false)

  const toggleDraw = useCallback(() => dispatch(setIsDrawing(!isDrawing)), [dispatch, isDrawing])
  useShortcut(shortcuts.draw, toggleDraw)

  const onChangeColor = useCallback(
    (newColor: string) => {
      dispatch(setDrawColor(newColor))
    },
    [dispatch],
  )

  const onClickOutsideCanvas = useCallback(() => {
    setChoosingColor(false)
  }, [])

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
        <>
          <Button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              setChoosingColor((val) => !val)
              e.stopPropagation()
            }}
            justifyStart
            tooltip={`Line color`}
            tooltipId="draw-color-tooltip"
          >
            <div
              className="rounded-sm"
              style={{ backgroundColor: drawColor, width: 20, height: 20 }}
            />
          </Button>
          <Dropdown
            buttonContent={<WeightIcon width={24} height={24} />}
            options={weightOptions}
            selected={weightToOption(drawWeight)}
            onSelect={(option) => dispatch(setDrawWeight(option.weight))}
            hideArrow
            tooltip="Line weight"
            tooltipId="draw-weight-tooltip"
          />
          <Button
            Icon={ClearIcon}
            onClick={() => dispatch(clearDrawings())}
            justifyStart
            tooltip={`Clear ALL drawings`}
            tooltipId="clear-drawings-tooltip"
          />
          {isChoosingColor && (
            <DrawColorWheel
              onChangeColor={onChangeColor}
              onClickOutsideCanvas={onClickOutsideCanvas}
            />
          )}
        </>
      )}
    </div>
  )
}

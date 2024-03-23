import { Panel } from '../../Common/Panel.tsx'
import { useColorWheelCanvas } from '../../Common/useColorWheelCanvas.ts'
import { useOutsideClick } from '../../../hooks/useOutsideClick.ts'

interface Props {
  onChangeColor: (color: string) => void
  onClickOutsideCanvas: (e: MouseEvent) => void
}

export function DrawColorWheel({ onChangeColor, onClickOutsideCanvas }: Props) {
  const colorWheelRef = useColorWheelCanvas(onChangeColor)
  const outsideClickRef = useOutsideClick(onClickOutsideCanvas)

  return (
    <Panel className="z-30" ref={outsideClickRef}>
      <canvas ref={colorWheelRef} />
    </Panel>
  )
}

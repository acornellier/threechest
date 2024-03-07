import { Button } from '../../Common/Button.tsx'
import { addPull, deletePull } from '../../../store/routesReducer.ts'
import { useAppDispatch } from '../../../store/hooks.ts'

export interface RightClickedSettings {
  x: number
  y: number
  pullIndex: number
}

interface Props {
  rightClickedSettings: RightClickedSettings
  onClose: () => void
}

export function PullContextMenu({ rightClickedSettings, onClose }: Props) {
  const dispatch = useAppDispatch()

  return (
    <div
      className="fixed bg-gray-900 z-[9999] p-2 rounded-md"
      style={{
        top: rightClickedSettings.y,
        left: rightClickedSettings.x,
      }}
    >
      <div className="flex flex-col gap-2">
        <Button
          short
          onClick={() => {
            dispatch(addPull(rightClickedSettings.pullIndex))
            onClose()
          }}
        >
          Insert before
        </Button>
        <Button
          short
          onClick={() => {
            dispatch(addPull(rightClickedSettings.pullIndex + 1))
            onClose()
          }}
        >
          Insert after
        </Button>
        <Button
          short
          onClick={() => {
            dispatch(deletePull({ pullIndex: rightClickedSettings.pullIndex }))
            onClose()
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

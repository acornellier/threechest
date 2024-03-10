import { MouseEvent, useCallback, useState } from 'react'
import { minContextMenuWidth } from '../Sidebar/Pulls/PullContextMenu.tsx'
import { ContextMenuPosition } from './ContextMenu.tsx'

export function useContextMenu() {
  const [position, setPosition] = useState<ContextMenuPosition | null>(null)

  const onClose = useCallback(() => {
    setPosition(null)
  }, [])

  const onRightClick = useCallback(
    (e: MouseEvent) => {
      const windowWidth = window.innerWidth
      const newPos = {
        top: e.pageY,
        left:
          e.pageX + minContextMenuWidth < windowWidth ? e.pageX : windowWidth - minContextMenuWidth,
      }

      if (position) {
        const a = newPos.top - position.top
        const b = newPos.left - position.left

        console.log(Math.hypot(a, b))
        if (Math.hypot(a, b) < 20) {
          setPosition(null)
          return
        }
      }

      setPosition(newPos)
    },
    [position],
  )

  return { contextMenuPosition: position, onRightClick, onClose }
}

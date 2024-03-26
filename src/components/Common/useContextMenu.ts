import { useCallback, useEffect } from 'react'
import { ContextMenuPosition, minContextMenuWidth } from './ContextMenu.tsx'
import { makeUseExclusiveState } from '../../util/hooks/exclusiveState.ts'

const useExclusiveState = makeUseExclusiveState<ContextMenuPosition>()

export function useContextMenu() {
  const [position, setPosition] = useExclusiveState()

  const onClose = useCallback(() => {
    setPosition(null)
  }, [setPosition])

  const onRightClick = useCallback(
    (e: MouseEvent) => {
      const windowWidth = window.innerWidth
      const newPos = {
        top: e.pageY,
        left:
          e.pageX + minContextMenuWidth < windowWidth ? e.pageX : windowWidth - minContextMenuWidth,
      }

      setPosition((pos) => {
        if (!pos) return newPos
        const a = newPos.top - pos.top
        const b = newPos.left - pos.left
        return Math.hypot(a, b) < 20 ? null : newPos
      })
    },
    [setPosition],
  )

  useEffect(() => {
    document.addEventListener('click', onClose)
    return () => {
      document.removeEventListener('click', onClose)
    }
  }, [onClose])

  return { contextMenuPosition: position, onRightClick, onClose }
}

import { useCallback, useEffect } from 'react'
import { ContextMenuPosition } from './ContextMenu.tsx'
import { makeUseExclusiveState } from '../../util/hooks/exclusiveState.ts'

const useExclusiveState = makeUseExclusiveState<ContextMenuPosition>()

interface Props {
  minHeight: number
  minWidth: number
}

export function useContextMenu({ minHeight, minWidth }: Props) {
  const [position, setPosition] = useExclusiveState()

  const onClose = useCallback(() => {
    setPosition(null)
  }, [setPosition])

  const onRightClick = useCallback(
    (e: MouseEvent) => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const newPos: ContextMenuPosition = {
        top: e.pageY + minHeight < windowHeight ? e.pageY : windowHeight - minHeight,
        left: e.pageX + minWidth < windowWidth ? e.pageX : windowWidth - minWidth,
      }

      setPosition((pos) => {
        if (!pos) return newPos
        const a = newPos.top - pos.top
        const b = newPos.left - pos.left
        return Math.hypot(a, b) < 20 ? null : newPos
      })
    },
    [minHeight, minWidth, setPosition],
  )

  useEffect(() => {
    document.addEventListener('click', onClose)
    return () => {
      document.removeEventListener('click', onClose)
    }
  }, [onClose])

  return { contextMenuPosition: position, onRightClick, onClose }
}

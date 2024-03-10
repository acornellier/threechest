import { useCallback, useEffect, useState } from 'react'
import { minContextMenuWidth } from '../Sidebar/Pulls/PullContextMenu.tsx'
import { ContextMenuPosition } from './ContextMenu.tsx'

export function useContextMenu() {
  const [position, setPosition] = useState<ContextMenuPosition | null>(null)

  const onClose = useCallback(() => {
    setPosition(null)
  }, [])

  const onRightClick = useCallback((e: MouseEvent) => {
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
  }, [])

  useEffect(() => {
    document.addEventListener('click', onClose)
    return () => document.removeEventListener('click', onClose)
  }, [onClose])

  return { contextMenuPosition: position, onRightClick, onClose }
}

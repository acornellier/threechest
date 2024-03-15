import { useCallback, useEffect, useState } from 'react'
import { Button } from '../../Common/Button.tsx'
import { useAppDispatch } from '../../../store/hooks.ts'
import { Modal } from '../../Common/Modal.tsx'
import { importRoute } from '../../../store/importReducer.ts'
import { ArrowUpTrayIcon, ClipboardIcon } from '@heroicons/react/24/outline'
import { isEventInInput, shortcuts } from '../../../data/shortcuts.ts'

const canPasteFromClipboard = !!navigator.clipboard.readText

export function ImportRoute() {
  const dispatch = useAppDispatch()
  const [input, setInput] = useState('')
  const [inputModalOpen, setInputModalOpen] = useState(false)

  const handlePaste = useCallback((text: string) => dispatch(importRoute(text)), [dispatch])

  const onGlobalPaste = useCallback(
    async (event: ClipboardEvent) => {
      if (isEventInInput(event) || !event.clipboardData) return
      handlePaste(event.clipboardData.getData('text'))
    },
    [handlePaste],
  )

  useEffect(() => {
    window.addEventListener('paste', onGlobalPaste)
    return () => {
      window.removeEventListener('paste', onGlobalPaste)
    }
  }, [onGlobalPaste])

  const onClose = useCallback(() => {
    setInputModalOpen(false)
    setInput('')
  }, [])

  const handleClick = useCallback(async () => {
    if (canPasteFromClipboard) {
      const text = await navigator.clipboard.readText()
      if (text) {
        handlePaste(text)
        return
      }
    }

    setInputModalOpen(true)
  }, [handlePaste])

  const modalConfirm = () => {
    handlePaste(input)
    onClose()
  }

  return (
    <>
      <Button
        Icon={canPasteFromClipboard ? ClipboardIcon : ArrowUpTrayIcon}
        data-tooltip-id="import-route-tooltip"
        short
        onClick={handleClick}
        shortcut={shortcuts.paste[0]}
      >
        Import MDT
      </Button>
      {inputModalOpen && (
        <Modal
          title="Paste MDT string"
          onClose={onClose}
          closeOnEscape
          closeOnClickOutside
          contents={
            <textarea
              autoFocus
              className="p-2 w-full h-[100px] resize-none text-black"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Paste MDT string here"
            />
          }
          buttons={
            <>
              <Button outline onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={modalConfirm}>Confirm</Button>
            </>
          }
        />
      )}
    </>
  )
}

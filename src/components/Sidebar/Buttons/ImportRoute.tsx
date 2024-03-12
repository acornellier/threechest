import { useCallback, useState } from 'react'
import { Button } from '../../Common/Button.tsx'
import { useAppDispatch } from '../../../store/hooks.ts'
import { Modal } from '../../Common/Modal.tsx'
import { importRoute } from '../../../store/importReducer.ts'
import { ArrowUpTrayIcon, ClipboardIcon } from '@heroicons/react/24/outline'

const andy4 = `
!nw5YUTToqy4NNUWc82isUSPhCa6g1aOGS4SGi(cLHZrvQWMkx2KN9sodLmTJxeyAdlPH)87FMHuoU7bx7UdDDh2o1hE31iQDTth25A3)4H)B)3gU)1N34AxVB34WJ(JNomo4AusvmQTJ9JhVFDVpe8)COBmP06PW4ps3)WWE3DxfZU3CnCxW1(Y6(jFk8Tthp6hc3p137ASlx3oTP3)IVpfE7FIp8um4gEXpPHahsxJjQz8Vx(Gq6rFo24qHdah14qh)VoPtdysC0aXVCw8zXV840RtyhN1SEH0KPlQtxyU5kfsADEkuYW1k9DDsFbZuiYsxOYQu6cszozco5cozdo5dlAfdos4Bj6t)vxAazbMQRiZ6lwukCaJvvYhusMmBBnPSHW3ItuYqYecenbwTAekKnbqSfB5ioTKl5AYMCd5tbJmQ4YQadxvdUO2YsY1j7UUI5nx1Ae5KIOSqUyPCbixkPUgjLSLuYwrwsrwsrwsLTKkBjz2sYSLKzlPYwsHwQ(MGB9e4Wm4fWAq8SiD6zWZMSitix2mCwwzw26BilNMaNSnAe0hNxa4t9eZkBxawNIzotcuMeijbktcuMeYzsdLjT0wqQXfYLyLErYRYqPDr0cAkScNxeAYqpmhXztWfxedR8klgs5Aq7iODYlBg5x08HPj2LNOOXlPnd28Ez(TArtRr88GuFbrxz7Wz(MzFwcXfsy3SiX8dplKileEy)Yu6OPSyj4IApvO4QYZx4AuOWYb1)Z0WE)4aDYot5AdE)Vth9hFLXjFVFBi9(cs)0w02Jh6c)QR7KpGhPlqpHkg8Vf)97d7E)JNuF8K01oU55Oalh93UBguQJIAV5jmVlbz0rmM3JGUk9kH2EAcT1GPcZcTReM6k0GXBQRWcx8Mczfwqc0e(3vAgySCBTHbkJm202TcYjrXxbfweLyR5nqrlsRkIIGpJIwvXYOyyv6su0Caab3cQAUbIVh6mjYVcjDDCjJDlsIMwKjXcvwIKy6zMeRQsDvsrWuaRwQRLrr1juYTOQVgkEZTrXARmzu4qcGekcBfpJc)AuabulbGRSXpS47yIOyN7KE17)FQN393)

`

const canPasteFromClipboard = !!navigator.clipboard.readText

export function ImportRoute() {
  const dispatch = useAppDispatch()
  const [input, setInput] = useState('')
  const [inputModalOpen, setInputModalOpen] = useState(false)

  const onClose = useCallback(() => {
    setInputModalOpen(false)
    setInput('')
  }, [])

  const handleClick = async () => {
    if (canPasteFromClipboard) {
      const text = await navigator.clipboard.readText()
      if (text) {
        dispatch(importRoute(text))
        return
      }
    }

    setInputModalOpen(true)
  }

  const modalConfirm = () => {
    dispatch(importRoute(input))
    onClose()
  }

  return (
    <>
      <Button
        Icon={canPasteFromClipboard ? ClipboardIcon : ArrowUpTrayIcon}
        data-tooltip-id="import-route-tooltip"
        short
        onClick={handleClick}
      >
        {`Import MDT${canPasteFromClipboard ? ' from clipboard' : ''}`}
      </Button>
      {/*{process.env.NODE_ENV === 'development' && (*/}
      <Button outline short onClick={() => dispatch(importRoute(andy4))}>
        Import Andy 4
      </Button>
      {/*)}*/}
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

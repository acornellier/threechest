import { useCallback, useState } from 'react'
import { Button } from '../../Common/Button.tsx'
import { useAppDispatch } from '../../../store/hooks.ts'
import { Modal } from '../../Common/Modal.tsx'
import { importRoute } from '../../../store/importReducer.ts'
import { ArrowUpTrayIcon, ClipboardIcon } from '@heroicons/react/24/outline'

const andy4 = `
!Tv1spUnom4Fp7HAikjkzDCNTx2lEhax0d9GW8iYdsRxNIeN(4s)TxrszlLPdGsq8NP4h)4ReH4hIJhoonD85RZR)moODXXRhpehF5Jh)0l)1Y9F)ZpfhF8WHtlFmD(YXtlXbRXMT65tZNoF)JZP110)UmDI80Jxxp9pe(XLxI39kBo8J4aexJJF7X5RjY8NVE(CAz9(RZZXHW(ZJxFAo9T0mz(4xZV8s24bO5l6O5Jjo0N9z(N3(Iv6v)PT5JLpiFC8XN)TN8Za2tXXaM)aQ87YFG81DuyNV1M)wPllp4Oh6FtMwjFvVIKmIJM00Kj1eZIjMwvylEPvfINbreGOcqKbi6iWsPNpu4hKON(PVvaMMW0(QilKAivmhzBTTXh2gzMIS9IN7LWpWx0O4itR5qtZvRbTLJnnkXwULtIZGOsWlYe6fDQvIq13wfumR9mPH2sYRt2ttn3BRQnOljfDBHCxsLcqPukDngjzBKKTvKKvKKvKKTijBrsMIKmfjzksYwKKLLK7nd8qscCClWBc2Eo8cC053c8IiBYeM9HHQBnf36Ed3cYfar2SqyDuja)JEInph2dypzZwMeLmjkUeLmjkzsSKj7LmzqgbLgxSuIT(Dx(Qmenfje23ifaAmLe0h2SOkcqFJnQ2NcSjTCiteYK8(WiCtZhNMu3UrXZpkddHYSm8wTOeh59buFHeDTTd14Bl23CH(gxeEA3fBVS6iDXr8Y(9Rmjxzxs4n1EPqb229lGND06(I63FD5L0PfzZUYghxtP)Nw9N)lJlP50ZR0)xi(NgrhpFCA9)MMUKw5v6AwtShxt)i)9FVC4N)6b7VEWehp90NZoyF1)4Hy7Sl0j93afN3rrzwskLsm4DCl1DKJNLRnIkDhTcko(onQ6C0TZGqhngsGwxh3wUb6QGEbur1tce64TTBG5k0okavyMltFNmzTdBBGl055CmbBytycDDufGzuJuyamLHUaVtKGnKjAOcRBGjkbdrJMPuR7KTU7WUgyIsWXPO(Ititc7Wgvf2qucbgwO0Yzutf22atuk0yek9KkneLzl659IK4vDAENzggjNyzknwIsluH1nWMkSKy9mmwHDnW(kSukvC9VsjQQWyLsKP0YYbRuI2gyMshPmu6D8K0qMsUHdzkrlBcNy9eSJPezh6GkSUbMtSmnoMs0r(2Hvyxdmxl52rNqPNDsyh2RQWEU9PNH1nWMkSTbM7yrgEJs72q83tPViRBI)o
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
      <Button data-tooltip-id="import-route-tooltip" short onClick={handleClick}>
        {canPasteFromClipboard ? (
          <ClipboardIcon width={18} height={18} />
        ) : (
          <ArrowUpTrayIcon width={18} height={18} />
        )}
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

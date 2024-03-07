import { useCallback, useState } from 'react'
import { Button } from '../../Common/Button.tsx'
import { useAppDispatch } from '../../../store/hooks.ts'
import { Modal } from '../../Common/Modal.tsx'
import { importRoute } from '../../../store/importReducer.ts'

const eb = `
!1v12UTnmm0VOceDZs6X1TvGoG5wahShfAsSCMx9SlsK7LxY3(OiLTvsZAzsSTip8CiPKDm3AxvDBtt7UXUWhUsEHRAST2vDxBy9BH9s2(V7Q2uxp0)l)HJTd9UsPqcE9M3)m4VR61nDJ(io7gpCW3hECSRZvYMVVACBN)vp9SdTnHhAAo6dhHqGWx7cW)t((TX(9(H(7RFh8EL0vf8()22V3T1vD0353fImyDekWG4Ebs2r6blFfnoAcxPbCdZt(cH4sF2xWKOPqRannCToItPc(yHFSrYbRbFyq4frMarTqliy6MI4nMRMPqeRmLSBOB4GRs4BAe(motUiYvHmHsUkiKzKiyKkyKmyKoSOumOfPVLyF8sDUaez0uEbZS(SKsURqFL58tLZmrs2AczdrFlgOyfYmohPgh7wLCjYnUI4gmrs80sQKPjzYmKo5RiHYpVlScZQbtQnVLCzXUPjlUPUwjpvu45nYzjLAaPwjn1iOITGk2sssssssssYKKKjjjsssKKKijjzsssusfxL4wprC1eXZiRbPNfzNEI4jrMvjeZBgwGvKGT4kWYOayKSrHG6yjbQpntmHSDMW6OptvsfvjveKkQsQOkPkvjnuL0sBbPbxvQfl1ZqErfkUlIsOjtkmwMRrbTEYJfrW4)h4GHFClBaZ9IpZ7KN3mYoB4dltRo)efnElTzWM2lZU2iAmXW5bX5ckZfNN5etM4(ee8ZGWUDgIPfxaINacFxWCinuiZssDwVNAumz(5lmnceECEW)o89x6R)40tWP4dB)dC09850v10v3PywMPqW5cRSOWyDn3iXHS7UrlTgnxiuWRbycfUKIsEm33gZCv1Vpmmwhtyp8K0O6m6fwPvy1gltWuWFriKe6fAoFfSQwPmgWUk6)CySpC6PQNBF50pwsYuH9XnD(qWFFFZqmRBgddFn(84RRU9cFW3NHX6(h
`

const bigEb =
  '!WA:2!JXWCQKuROKl5y5PwC(5MQcfLFPLKQtLNAQzZ8IsjZ0slZKlnNsQKvJknZuwuQLLMzjBH5gvHjbvwI5uAQHTPKlTOIsnVscO0CYHXpbLtWLMuoPwwQ5WCbccvexknV0tn)88mLkU4Kko1Csn5sYm)84kOcaQRILAhcY4PevybzLFj5KBEzNzXxGGYRiRskTGcZpVIko3SZjZYQ8ccS9o7U3(RT(gBU1IlT8kRMv2bQw(fuyrfp0WJm6y92x)dm44tm5utF2ZD(lCX6QVHgBQ5wATT27OZU6UNkRQ6AQTKslR8kMz25MFHmpXjp1PpZvXoqDd0m4KvMRIFUzNvozMxPywkMNLOcZmRCYoVClOvCYmRGerkMVLIkds38YpqlLzw1IvMHGKI5Gso)CYVOIuoT0mo10sdaa'

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
      <Button data-tooltip-id="import-route-tooltip" short className="flex-1" onClick={handleClick}>
        {`Import MDT${canPasteFromClipboard ? ' from clipboard' : ''}`}
      </Button>
      {process.env.NODE_ENV === 'development' && (
        <Button
          data-tooltip-id="import-route-tooltip"
          short
          className="flex-1"
          onClick={() => dispatch(importRoute(eb.trim()))}
        >
          Import Andy 4
        </Button>
      )}
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

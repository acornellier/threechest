import { useCallback, useState } from 'react'
import { Button } from '../../Common/Button.tsx'
import { useAppDispatch } from '../../../store/hooks.ts'
import { Modal } from '../../Common/Modal.tsx'
import { importRoute } from '../../../store/importReducer.ts'
import { ArrowUpTrayIcon, ClipboardIcon } from '@heroicons/react/24/outline'

const andy4 = `
!vQz3UXXXru4NiTO))NlJtGbCacJdwHaKBwyjXDTvmdPd1sh7B0ZEM(CQE6dPyaImOK39R2DoDpt1vF6I6K)0BpD82pE5Yh)Wt3D93pDtOC64)585FE7vNo(UBV9H7)7NF8tF8H7pDtkMYNo(HhU7Hh)(3D35Rxp)D3F5HXf4DpD9H)4G)X7)XtFZl(m3(BNUXF66PJ)67U7PZJp(hE6XhpF)1V)P7UBeA((Jp9(7o)RNj7x2c(PTp8nE5Vg)eWpXt302UMBV85bUoc9LF2TFs4Nm(PGFQBVUoUo3K3(tF7)T9hVBl22F8BF9YyyV9TMxVRJVmFtz8M2RQ01X1A9v4nJthJNVCjEwgZ8Je1zrYUk6SGxzpNeEol8CA458OJPsd)mg(Do6hVSQtGOmmtVyK1plIYpEgF2Ko(Y6ilAt7kVYno874lgDyKfcyOfWtRBcjm2czo22Y044SZzPVYPPVX5zWXjA45pfCq1geTRpsE5n7lxKV38P2nb7MsqFqUpLSha2JsM1e5n7iVzN4ukXPuItPKnLs2ukAtPOnLI2ukztPeMsLxDG3pZbEEoWLbBddVogD15a3MKYDI4(IH1LnAx2YRCz98l450gtempwcK)ICI5vUVpGRJpZ8ozM3jZ8sM5DYmVtMT7KnENSZLGmXnBpIt19l5lUdnwfrbBYuX7Lp6yc925Nynj8HN9zC6764JOAWveCL8(Ir)Zs(WTj3ZROuXB5IHUTw2)APOdn2QhmYl4OtthwJV5yFEjcp7s0F)(LygCDHc2fc143)kx4xzFkLF2ZE(GYN06l(kUqx3lu)NE6(F88d3Zk7U0PJxpF(Fnk9)(th)057o)HRJ9lKP8JF8Y1)6LlF68vuspG5eUIxp)BB)9F4(B)9p)dBxOhE))C7BVx3)49JDtULV9BZ(UVvIHqSNkLw)0L3KqM73(MAQ3QHymVnC8XmcL5mAmH(MX054XF6XhE6wEtj8fx9sp1J9AR7J(82)nUejE1l1qWTfTMZT22pV6v)V8Wt3F9Z)WXF(J)YN)ZuKX94513wu6p4F5x8c(pCN(nyjX3mUXCh)AhtU2bmmo(gFjZV9eMaSCapTMWYcw3HnaRhQJKYjCldBN6xs5Pw9doKpSJtcEjNh6vDhIirzh3eSjze10hy)HcQRVJdcoUWqYA4a31yhxeCDHPKPdJAFljJUfoUKmsjZhYOq)ooj4LKrkzzizCjzSj4LKjkzBizAjzki4LKjkzFizAjzQiytYaQAUHBUdnu6CIZUfo7xyizlmYBYXfoj48cdjBrKqTKm3e8sYcLmnsFkljlbbVKSqjlJ0NYsYsrWljluY64grzjz1TW1LKvkzBK(uxswtcEjzLs2hp0QljRnbBso2Yfs29JpsZVWbbhxyizpmKSLx4IGRlmKShhs2ws2DlCFjzNsMhs2xs2tcEjzNswgPp9LK9MGxs6DuZ6b4H0lbcAGOeG625BYsGIgOkbgAhCow7rehfIMbMvIGh8ac4zfQOeiPbYsGcce5BQsGMgOVceO4juPkiIhcAar8afppEA6dI4HIgqepqXrDcFqep6Karr8ifhzM(OiEmPbeXJu8oepkIhBAaiEf6HYubVJVXlbcAGOeaI7dqCwRYcu0avjae3hh5B(KiE2jbYI4zkEcjCzr8CsdiINP4fKlLfXZnnGiEHIx5gyI4LGgqeVqXBiHRiIxkAar8sZc0OzG0xLzGVWfaUOC0HTGXyRJDewW8oSSGJX02ZYmDbyW(oKl(ifR98EChw0cR8mSOgw3T9eCC3v0dR6mSOiwZT90lzUammwXzyrsSEZNh3vdIKy1MHfjXATTNAoZfWe33XrrsSoZVCbmXXfwKeRX8y1tuKeRWmSijwFfWkNKijwDzyrsS2kGvnjrsSYYWIKyDviEOyUaM4(oolsI1uH0qYSijwrzynZbsw2DbmX1fwKeRLc1r6trKeRKmSijwhfgleUPisIvrgwKeRHIUr6trKeUaiUkscxarpC7kscxagwKeUaIHr6tvxHuxyrs4ciMgVSjscxagwKeUaI5r6ttKeUamSijCbelWqGijCbqCxKeUaIOeqxKeUamSijCbe7dj7IKWfGH1kbdjtoS7GtRfaxaZaA1a4ci5rvoNwpaUaMb0kcWfqkIDhCAnb4cWc88crq8ekq9SsrOw0mGkoQgLYOi1ZkhH6rZaQ4OIuQIcvAjj6cygqfhvLs2PKuXrDPzavCuzk1XUdAPj6cWcOfNOlGSNV(zfHJsavCuHkhGpfTefDbmdOIJQuzuYWRLPOlGzavCuPkN5RvXrTQzavCuTkxG4A5k6cWcOfSOlGCfIRLSOlGzGNTbeeVPUaSavjGkoQCvCiHtlDrxaZaQ4O6vXJeoT8fDbmdOIJkyLas40syEudZcOfX8OkwjHeoTmMh1XMbuXrLSsgjC1NT5BvcOIJQzfCWwVuodEtYFvEtkG(shkBJYY0HckQBd900Hc2xiVdllyLW40HcmS13HwHbAJtUtnnkcVZlCsWqUi9JbmtTRlCtWDIR7ouWshunWWbbhjoV7qblnd5fUiytY00HIdl9d9DSDuaGJMKHPdfhkTeJlCsWMKUPdfhkDfRlCtWRKqU03HsJyLVHdcosCz6qXL27tHHlc2Y8tthkomyt9DmxWtC2KmoDO4Wwh54cNeSjPF6qXHTMY1fUjyij(ISpfBNhnzoumCqW2A86SpfDC0P5k86SpfgUsCE2NITJtxnhkeZ(uqC1Kmo7trhloRXfojytY9(u0rJRQ1fUjyts3EFkqtXA(foiyijArK1Nc)EFkmCrWvIR79PafhB9DS1NcG7w5Z0Spfnu8Thx4KGnjNougT0PAoumCtWMKOhcqZwH9qWlbcAaSHrF5qX3YR(umdu0avgySDSJAhzlp6RaSHPwaujkZtvZwM2c0vsucK0aM4JsASTPnpD(uLannGj(41wRt5yp4LabnGj(OIV1(02QpfZafnGTvjoZheVwzlp6Rawtuza6qHFBRnQO)DMdflqsdy7tpUlyTsnrNpvjqtdyIJ(jqXrvsZHIfiObmXXwau8aFtwcu0aqCPpfJ(vJZ42xbyJvTathkJriBTAPZgyeLajnq(0Y6ceVWXEUkbAAatC0bciEPUCOmde0aM4W6cfpV6tXmqrdyIJVnfN70w6RaSiMfavX2mTbRlu84YHYmqsdKzaSFlfNDqOwLannGzmC3HY28)qHoukFTouETFvkzK)IrFUoTOKHVcmYZO8EEhwwqmMrQzZGbArHqwzWslnp04SagE864cNeSzEFKqo1BCdOUWnbdjrFectjRMffdhemoUcQeXAbC9ppScXfbJJQi)Quy9fEqf5xLcXr7msoZIYapTOy4KGTdNvnlkdC2SOy4MGHK064uYQzrXWbbdjr)M46(TSgNzrXWfbdjrchxZtp)yjpXz3cNTZaNnlkEU7ewUB4KGhsg77nrzGZMffd3e8qsE69YuYQzrXWbbpKKDgOmLSBwumCrWqs01HYCjwy2efGTv30sbKeD0WwBtFjXfojyijCkUVUoVAIsBArXWqs8Y2uY6SjkehemKKgnMs2NnrH4IGhsgGJcArH(aHffIPffIHfLaQ4slk0JjSOy4KGhsgkllkfSjoSOy4MGHK8uWUPMOUGxce0aq2iF9uxyljlbkAaiDGgCO2SjRWIIfW(D6YaOsuWZxplAdtgrjqsdmeF7CH7nrXZJYqlkZannWqCplofMIpg7SXUwGGgyiUN7kfMIdVlzjqrdaXZ81ZTRWja7RarNeGT41SseSaW7sucK0aqCwEMLOkSjtSrVwGMgOZallkia2UQ()12vUUZ9)E7QsbBcHtg1s22vLcmNJZf1XCnVdllyDhogXrhk913HilXOJKKsL(ccaZS14cNe8qUgtHlgg(dw4MGhs2Hd7aLe36gPgtCqWBswDO2yGsIwGpslM4IGRdm8IZtu3rVngPegMNOM4rcr1H9o4jQ74ydX4cNeCMxK88e1nSGkwx4MGXSehUMNOUXg97x4GGh3y7U1jQnCEHlcECJLE75jQnCFhNfjZ4zjMc8e1TWC7QjojyK6GB98e1nCOYCDHBc2sFMBxfAJFTaiBV9vNTx)IS9Q1qeBY4q2E1HFT2jtUmUogSSG4XszMTh6ipSVdz)JiDKTx9CbmZdOP94cNe8qUal)Yvx8GG1fUj4HKrVKTdxbJS9joi4HKr(7SkTUiiB3WIKiBNUz2Z2Bw2oX7z7nlBpHFTnmBVbhEiB3WjbdjrTDlBhPhiB3WnbpKmGcdw2o(1SmY2N4GGXn2UKTJBeJS9jUiy8Ke36Fz2UHFz2E1fKSDIJlSSalVkJKxZsK)2)QZFFLQ1D)E(BpoRw3Hdhokq)DY7WYcw3HystJt9DiZFTon7xyOf9d7xIX8xdN3hym)nY9XQlCtWqsCuo2)Za3aYVWbbh5cS4m)nGB5SAnXfbpEY6HllM)gGHdK)smZFjg5Vb2UsizCL)A4KGXQuCmnM)M97vRnCtW9DmZFZ9z)pN4GGHKy6W83kgGi)1WfbBfgs75V45lYFds)pTCbpxeeM5V99)DAnXjbBlzCZ8xuqZ(Nr5tF82th)P6N(h)TV7TV9F)4FCJD6)o
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
      {process.env.NODE_ENV === 'development' && (
        <Button outline short onClick={() => dispatch(importRoute(andy4))}>
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

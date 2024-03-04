import { useState } from 'react'
import { MdtRoute } from '../../code/types.ts'
import { Button } from '../Common/Button.tsx'
import { importRoute } from '../../store/reducer.ts'
import { useAppDispatch } from '../../store/hooks.ts'
import { useToasts } from '../Toast/useToasts.ts'
import { Panel } from '../Common/Panel.tsx'
import { ExportRoute } from './ExportRoute.tsx'

const importUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/importRoute'
    : '/api/importRoute'

const eb =
  '!1vvYoUnmm0FPOnBRJDfOxChanOhfAsSuGBDTlsKNLlZ3EPiLKvYKci7yBr(47rkYyz2hTMHrVF846u4vBpVXAwhhSMVogE85Wjj70xSM9ddlZ)WD(Y4YSTxkKGvhxMwo)W(jxi4(2SFjI0(1WYNIFFC(K9J3yZWl2EMnynpTFA1fn)465ZU5WdRttWw7kFWSEyY9Kl(rR5VWUxaR7zv3IloUe2(oau4XR3ie3692cljUu4QbxTWZTrC6vWLg(rJ8PVbUyG7nrEdELXleDMEPj(s3DJuiI1Mlu2WAeoVx4Q4mzIOwfYek1QGqMrIGrQGrYGr6qJsPdxr6Rj2hFSTwaIkAkVHzAxvqjZvOTYA(PQzMij7wc5oI(A0rXoKzCosnowT65sKBCfXn4mhXtnPswljtwhPt(osO8RRc7WO2HbvxxsUnz79v(LRA98usHxxilskvasLs6uJGs2ckzljjjjjjjjjtssMKKijjrssIKKKjjjrj1CxIRDeXvzIxr2oKEAKDTzINezvMquAg2GvKGT5oWYihyKSrHG6ylaQ3DMiJSUq42On5mPIYKkcsfLjvuMuLYKDuMutTG0bxvQelBlqEtgk2frbSRskmwLPrb9y2InrW4)h4Gd)ylBaJ9MnLo5SQsIYUnsHrjLUQgXi9REpGL87hyyEq8Cbf5MRJCIjzUNHGFfe6dfiYBUbepbeoTV4INCPmFH6jyuxmE4eZu48fbkdMebkugu)515tULzA0(oP1eCU)eN9FWAU4MChdX)WO0VcoEE0h(U3FXfWz6CuuiKb3lW9pmp86B)eqA5WVa3VG7BE25(njd7)('

export function ImportRoute() {
  const dispatch = useAppDispatch()
  const [input, setInput] = useState(eb)

  const { addToast } = useToasts()

  const handleClick = () => {
    fetch(importUrl, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ str: input }),
    })
      .then((res) => res.json())
      .then((mdtRoute: MdtRoute) => {
        dispatch(importRoute(mdtRoute))
        addToast('Route imported!')
      })
  }

  return (
    <Panel className="flex-col gap-3">
      <div className="flex gap-2">
        <input
          className="p-1 w-full bg-gray-100"
          placeholder="Paste mdt string"
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
        <Button className="bg-gray-200 px-2" onClick={handleClick}>
          Import
        </Button>
      </div>
      <ExportRoute />
    </Panel>
  )
}

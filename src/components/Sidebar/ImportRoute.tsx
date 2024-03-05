import { useState } from 'react'
import { MdtRoute } from '../../code/types.ts'
import { Button } from '../Common/Button.tsx'
import { importRoute } from '../../store/routesReducer.ts'
import { useAppDispatch } from '../../store/hooks.ts'
import { useToasts } from '../Toast/useToasts.ts'
import { ActionCreators } from 'redux-undo'

const importUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/importRoute'
    : '/api/importRoute'

const eb =
  '!WA:2!fb5slnmquuyKHHqmecjHqXPiQnOIrenn9HjIkwFHkIAvRiIiTjZeIgt00eRf)x4sx6YUSRk(Rq)R4sxzgIp2CH75C(Uh4ouJAX4hJBTwGt3XlvRdgFd4vhpcXZoXpUlSyINt)T8IpPtSBjD3nR)qt)eCJ(2jrr4G4dt89v(8NLJtA5JFa7dUt8hLnscCXHb7484hp3g7JTJ9cdgU(DPuTFBaeybGIAa4BaidlhF7KoDFcbq81Td9dJIujedmHizIaslMgLzfeJgltVrYp6ytilQKtWIbY(oFKknMjzaCinowe3xRw1CPLNBEDJYtRo5mZAPikJa0C0dAGd04fq8FT5ARV9oNE25xC5b7T)rhNDNwlMwyfeOIurlrzbPYAmWmsITbovD38JOKlvM7VIPYg9U17MW7BAJDVsQ6)Lzs2QG(ciqbDD6OyMdLIqDmEHLJjNOScVqb9Y0ev(L1SLbonrjeK6aPoWmwk9uPSxpH6yPVcQyZI0Y(ga'

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
        dispatch(ActionCreators.clearHistory())
        addToast('Route imported!')
      })
  }

  return (
    <Button short className="flex-1" onClick={handleClick}>
      Import MDT
    </Button>
  )
}

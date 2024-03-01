import { useState } from 'react'
import { useRoute } from '../RouteContext/UseRoute.ts'
import { MdtRoute } from '../../code/types.ts'
import { Button } from '../Common/Button.tsx'

const importUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/importRoute'
    : '/api/importRoute'

const eb =
  'd0ZhlaakOO6uQOWSGIYTGISlkIFPIsdJsDmsltHNryAk5AQ02G03OKXrvDov4GQiPfcL8qqWevrLnQIu(OkI0jHsLzQIOCtvKWor)ufPAOQOQNcyQeTvvKOVQIiolfPQ9kdgIddulge1JbYKPOUSI2mv6ZuKmAOWPPcRwff9Aksz2q1Tbr2nv53k1WbHoofPYYPWZPIMUQUoiTDOu13HsX4HsPZRIW6vruTFqDAYaaB2827uonC6y7fxIHiaZoCDDack(FIOAhauhMdacoetNN8t)uX8HPlaSzonTiAaBiFMtqVZKrnzaMtg141FzY4ETpqvBvJJiMghOMyP222QVLIoIIOgxHv8gWPWHNzyeN79JXegzBaJSFmMgWipggtWpmIX0muqVJThmceGamcypZWiya1uWi4t3hgbBaJJ3hGxy1hhjdWCYOgV2ctS9TpqT9vXWkoIysTSnb13FG6pwlbAue14kSI3aGagGD4bJ4W73WiGnab2BdjWEGMgWiBpqtyeiEcJnKa7bAAaJ4WjmI5jyZ9b4fw9rrYamNmQX71Ye1h1)AJABFhXrethct8flDDxkkQyffrnUcR4nGtBdcQtyKPJhJPbmYjDJdggzBaJCoO4yafgz4zggbSNzyKhJPhmceHIJdJ8gGDIbmY273WipgtyK9JX0OpaVWQpUsgG5KrnUe(MGQlH11sS8fXretk61K79Aje2w2w3OiQXvyfVbabma7WdgXH3VHra70PdNpyV3jmY2d0eg58NWydjWEGMgWioCcJyEc2CFaEHvF8MmaZjJACzVmrTqVQVpQpQvCeXKA5BckQ9Y2Fjwcrue14kSI3aeyY5e8pnGrG0gQ3dJymDcc68S4oCNMYWbepR5nuiJpHrotOqcIWiBSFAaJGnGXX7dWlS6JOjdWCYOgrfdtgQav17YYkoIyACyBIWYEzHUoU2Aue14kSI3aozqD(WiBpyeicfhhgrXmyKThmceohmcMd1juW44Nag5K44XyAazWgM2FwicfhhgX6mWmyKThmceohmcMd1juW44NagbIqXXHr0XzpvdqyajWMAcJaSXpdmdgbSNzyetpyCpO9b4fw99bG9GXHotgaiOggtVhakKXNy)epQbacQHX07ppuC84ra)CcjhEMkihGHd3)0DDDoFNjJOj77daeudJP3FoOEMAU9WoZyBuTxbarO44otg1KrnzuJ(XrC0hhjJAC0hfjJA8AfhXRFueVhXve1oEJOAenoIwrr0pUIhXBuTJO9XvYOg1(4nzF0pzuJACeh9baAJVncW1vmDDJhj77JJKrnzuJI(4izuJR(OizuJ6ioIQikI6kUI6nEJkAen6hTIhr)OAhpIQgv7OvFCLmQXrCef9baAJVncqmDDpM9rrYOMmQXBFCKmQXBFuKmQr9ioIQvuev)4koSJ34qJOrHgTIdROFC4hpIJJOAhf29XvYOgv7(4nzuJAFaG24BJaCDftXSpUsgfjJAumIJOqefrXkUIIB8gfOr0OWpAffwr)O4iEex2r1oU0(4izuJ(Xr8OpEtg1OOpQjJAeTpaqB8TraI5X01TpEtg1KrnA1hhjJAenoIw9rrYOgxJ4iUerrCTIR46gVXfAF8MmQXrF0kzFaG24BJaCDDHSy2hrtghjJAuTJJOQrrufXvuh9rrY(4nzuJR4iE7da0gFBeGy66kM9rRKrRKrnQ9baAJVncW1vmpMrrYOgVR4iEhrr8kIR49gVXlAenU8JwX1r0pETJhXRgv74YQVp6NmQjJA8Oposg1OU6JIKrnIoIJi6kkIO34kIIgVrurF8MSp6NmQrrCex9baAJVncqmDDDD7JhjJAYOgv7(4izuJ6noIkAFuKmQru)4iIEefrl74kAPXBe1QpUs2hVjJA0Qp6NSpaqB8TraUUhqwmJhj77JQDYOMmQrD0hfjJA0YkoI(2rr0xJRO1r8gT87J(jJAuTJJ4rFuTtg1O2hvnzuJAFuhjJAu7da0gFBeGykMUU9rvtg1vYOg1(Oksg1OghXruexXv8gVrrenIgTIwr)OF8iEev7OAhvnQAFuVjJAu7da0gFBeay11vmJkAYOg1((Oosg1vYOgh9rvKmQr9ghrDefrvexrDfVrfnIgvR(OEtg14OpaqB8TraUUIPRBurtg14OVpQIKr1kzuJAFufj7da0gFBeGy66Em7J6kzupsg1O2haOn(2iaxxXumJQFYOg1(((aCoXNGEhBVKrnE03haOn(248GXN)pXop3DYaad93qyJVnC4zQWkaqB8TX5bJp)FIDMX24QpGFITFaN224Hr82Wi4BqMwFba'

export function ImportRoute() {
  const { dispatch } = useRoute()

  const [input, setInput] = useState(eb)

  const handleClick = () => {
    fetch(importUrl, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ str: input }),
    })
      .then((res) => res.json())
      .then((mdtRoute: MdtRoute) => {
        dispatch({ type: 'import', mdtRoute })
      })
  }

  return (
    <div className="p-2 bg-gray-900 border-2 border-gray-700 rounded-md flex gap-2">
      <input
        className="p-1"
        placeholder="Paste mdt string"
        onChange={(e) => setInput(e.target.value)}
        value={input}
      />
      <Button className="bg-gray-200 px-2" onClick={handleClick}>
        Import
      </Button>
    </div>
  )
}

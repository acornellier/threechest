import type { SampleRoute } from '../../util/types.ts'
import { type DungeonKey, dungeonKeys } from '../dungeonKeys.ts'
import { decodeRoute } from '../../../server/decodeRoute'
import { mdtRouteToRoute } from '../../util/mdtUtil.ts'

type SampleRouteDefinition = Omit<SampleRoute, 'route'> & {
  mdt: string
  name?: string
}

const sampleRouteDefinitions: Record<DungeonKey, SampleRouteDefinition[]> = {
  fang: [
    {
      mdt: '!fw1YUrkmqWpMCpI2gm4JRuUKlOvIC2ANHXKqcbwXJ84Y(TV(vZyB8OiHe4MMQ6QA3gbiEs0Sk)Av08GS702W6)(Z6lZsz7lYL177NenFkLVjQH7Zenx6766Bvj9TOMOdS1FrLWP5b2BYkYSO5JtdBsnMTBZZYX1FVnmiQZ056I0SDEq(HCWbPl6dBJplNgF8YxQ4SC9BwKdY21(PrfCQY7VkKwupwRl5AM9P6cvM1e1A9DQ6sFpxDPUVkQlDPXCPvAddzU4GBnGR5Uejzoaj2uAANgMu67UUU8SUo9hr2lgW6gRxllEi9aGWcoybIRqbAi(A05g8P(4dH4x5WdHJeYh(A(XAp3KyUp25HyBQid4rM4rZbkrvufzShu15kRRv4ZmnIz0MGi9yQeZlkI4HeRqTgVIzEG9fyY5xzGKKgJazOa13l2nAQhUghXvwK08PzZ2uR85dPdzdjRmKK8iWjhfJ1B5bIjWmnIHgv8zygqed04YN7SlNVxen(uM2oiqY4Evoolzha3lmsC7M6jD9lOOKcbKV3(TsHF72HJxAaVX78bAIovYHv7oTIe6n(uj9UitdNzB44Mcp78wnOedY2wrrsbymOcCdmZXTDMLDDMTk8iSD29pZudvLdj(TgTbM)jZaE0mWIMzJn3eJDixa)wZ34EUJ)gWtsXmrY8pho5bcG9BzrTe(pmyRIjhLV)9Vww6FE8D1F0wm)2sfF68RQ)JHlf)h',
      name: 'Tactyks Easy',
    },
  ],
  kr: [
    {
      mdt: '!Tw1sVTnmm4Fm7EHE4NhlqVSlcdq7SWACKA9QI9GF01CP)2ROfvQKAmYomaHilgYp(rQpAROQFQKl63wuYh0MhxTlV)RLNN06UN1Zl31pQK)vRFrjO3ruYJ9gtFNZPZkbdmS2FujpvmD4Lzl)CzJs(6J2vnaA360KEy5hRwRsqaNrlY1dw9RAlIjA9H1HN0JdF)4Bo71WFmRT6UL(XbhAo69hhqZUhf0OFeCNNcMsu42xGN8MPOzGKco6wH3nrPBb7vUfSx7wWEJBTbJSB0ooPKFZykigZfGdO3IOtji8ukIpLHjGIeQadH5pwIhlqektZhKT2T8Xbh5rEhHfnfRAeRMazqUu91AP4tCQsalIbhA8vSh(SCslVEygdap4XgUTzrr(hUwYAdE0Q3cKMbhl7mFpsvq8DZgWH60OA2Rba1c4GViQ2d7wKIyXLHoR6)Gs0rHnTgOhQVcEj0oOuXUvDQW7t(qcIxAqVWcIxES4fifTezfTcP12OzmFshaVWN2lcc82kTDl4K9VZW6WFR2E16wWir1x8laOxDctWB3)62RrqPEBuDfJxipvO9GMRm1(L8W2B6ZpcXiz6LmnnJFR77WCQxHYY1Fz9Bw2ijpBWMxMDU6wd6Efglhh((9zmUnMXYZx2moNDJzANn9G(057NN7FA4K7liZBFNWzF8WVDF4iCu9b',
      name: 'Tactyks Easy',
    },
  ],
  murd: [
    {
      mdt: '!vAvYUTnmq0pMEpqCtlhlqU0lcfq5mrJTPsuTIuHLKtYL(TxsXzu4qtH0CjHCWWzEV3SyPz6h0nZM3M1n3BAFCPF(V)A(5lgZXNntZ31nQBE1yoRRz3LPBo1122D06076AUZWs3jDZ5LRxvNlgoP60nxFSFX4c6XLlxmdZ)CPVxxN5CgS0SCO3C10dXeSE)YWtMXHFC6nR98v)Nm9MJZDJd2WzX3FSrAYESMf8NAP1ZAUUwz))S7K3ScmN7nlaZcWS0Bwgee7vfCLTET54y)4fDZ3ABLzTTbrh8cZbZLeBkQzfUds7HsAAlbpR8MZdaPZRQ051L1Q2G449kNY0ci2rPeIDzeX3GkGu(Tuvgkn0xxaVUeETJpwvZhTCmABqlsTfb00zMtlc3W(dLEvxruDoQ6cKksu1Zq4WO4OcFsg(eK(mofA5be1AUGaTnXK2ZfiEo5BRaZz0xZf07IY9l7YpsFvcvZXbbqbjqAfudG2dwws1MuP9nxRWGZJaB(xiTo)l2Nm(QONhOMOWHhfIxrq)S7Um9SdRGmgeWNkq1aMV1wLHvFGAm6yUD8DhQI9vkGQ5GcVofuaiRerwaLX1faBf3GeECMjyCTdLJDOcSPwcP3V3Pa37uc7Dc1MckIQ2Amz(Ymp5kSqvNoMfQAWWmR8Zww65nplQX6tx2byGfvve)hvfcdOBzyve8NyJhWqwI(U1ksgwryyfbdnpbudBPzrqJUxmXgpOXGNyFJdk5rLevu5F39sGh78thB4LhXJQ0TvFSOY3mWLrL6Obnr8cq5(TqRTcwBMbZlV)9PPUNgEX(vctRFkG1(4HFB)2a8Q(Fa',
      name: 'Tactyks Easy',
    },
  ],
  nalo: [
    {
      mdt: '!fwvWYXjmm0pMEpdYym2h7m5sVW0zON90SSMe2qGUlq6Ml9BV2yzwBVMKlzJKLFpPNKfsq(lz9S66SS(rv7tl9Z)73ZVCrPAErnn)q3OS(Vk1RYk4Hmz9XU22UgDqFiRighlDhL1NoF9804HtNlojRF)P(fLb0MLlxudZ)CPVxwLzcg9uVCOx9UQhXe9(4YWZQXHFC8Q2pB9KjvVQzUBCqdNo)(JgPj9)wbE)Pkxh5SoB8m1gvuR78eU1oRkm)sLvmByqjghdJJGOsr)WQDDZy)4fz93ABPzTTB86iNhskuyTDGqrWlrslCXLHhaaMEadZpOmKydTIwpsSiuekcIO8GfMh5r8Z8Yld7CKCrKiuEViqVbmzh0kctgHRwZWZlr24HjjpwK4UlkI6zUdeoXllwZoWTnllwS96PMcYegZVCS9edVKWcHqCZkqucfFLGUNLI1qP(ZjRXJtTBzyP7aUR2qXICFRWowWnxL9jt9oYt0PW5cE6NsqwADZuuw5v4ZDQHkpWDLmoAkIEIuexFcu4SzrrqQCtVCTeipSslczPmQIURn5EDd2hy8q6arOnzhLrSnrb2PjichINT3whipcFYxTfcVb4vpg8YJ4XzttWR3aaj)tppXYierizx8g)0i(Pr8r3BbdUfGe2o30PO6DtVc9NyHGDxab(Qnc2N2KOXoclYUC)xiR4O9PguV9X3NM6EE4n9x9Mw)0M2V(ZN6V15mL)ha',
      name: 'Tactyks Easy',
    },
  ],
  rlp: [
    {
      mdt: '!9r5Yormmmu0pg2JQttFTej2WMkKcRJyMoPqHmTOPP8AbF7Kh2dnbklMQep2NC9nUvcY7KcJ6DJuCTQF3I2819MhpPuDpQMnxomjfVPuplBHlZKIdd99dD2K(q2YCbwgoiff1zvFURqBEzNu86o9IYbTB50j1O52fTw2M5sgJiw2RvVQ0itm61lJpOMgV5W7YwUN9SsR6mdtJwAw59If0SDzlS6HhHXkgCBJDRDJpCBEqKTC7YqA5yA1)FA8i4IUj90jP4I(EEwF)QJlKflMDbYUmMvEmlhPM(Z1XwjSvfvHSAcHlWWCs)8gSbkYczuUTY5NjVse7RdnKNC1wf7k)h6zjIdWZgidHJ7PMQmQlISGa3QiUqcU8eC8F3BbNSocdlPm0AHnUCDQj4fnry4O4lsuvk(8y3yL8AWUerMLuqzcyibmG5Xs1lnmIvw(h57gnYXzB6wPkjponcH55VTkW6l)X(R)BFR580bQ4SvVkUUpQW9LjVNqJWNhJibYyKLsseinc1KitvhBRxzH8ixIgERtDfYwaY)aYazaEOvOZ4frf2b1yhyhFSNIBb4(5)pWjmQ9A2E(ZpgBJPgvh)4Q55HhgpA)04S)dG24t7FY(frAR8Ba',
      name: 'Tactyks Easy',
    },
  ],
  tos: [
    {
      mdt: '!nwvtpUjqm0Fm9(kMVyGJvAV0lOkrppQBiZKqdlSIps39s)TxdJzd2HiTxIYmyEp73Z24eUF5kh9Vp6kF2hEzQz8F)E8CV3xD2pm(uDNR8VE)fxH4Pex5X6qOUcc6dxHC(IP6JUYlNSxU(2z55(bx51xAM8ZGwn137Bh)5utJRizoy8MYPdn(R(get82NNAp57A)XX3bOxcFW34RgR7Ab0G07naOb4VfIn)uKbrocVb9OcpkJh10NA28u4nlulxxw11017k)wiOtcHnOIrRWWLAkNclLulLufLuXkRIekTZKMh2aesRGX2AAi0uAtP8yUVO03YlvYkCiicY5nj1HSOwy2MucfL7izfPuqT0Jzmk17tzimNRBGdJkJYHKYHIYHIXH8ETwF79tPoNLEmJkWcQubg6dQl99oq0FZ2YzkLtnLtnA2ggxggxQ7RVOTLt0WCkzge9ukPwwHMIHzzjrkVaZrrve7UuuHrY65KBfYLbl8EMGkz4OypxREuV76CmwjAMOUAGgwEGEGiLjt4eliJSe0UFxw(NDYOKr7gVrmZheP7imWS2IldZV71zHf6IuinS8Jp59qbBDdumtLSbyT4rtSR7wIvKuZ4NPxAZUg)olDIkHKPBFINKHNIyG7SrreRilD2tz(s6DHwUJFnhNfJBEffSOSyEmdgWJnmW0g0ao)NmC7)UlIertIBvSvQkMLOY2FgsXL8KVyjQFSfV0Aa35B9V(X3hgQp1(k8H7HLppd33D4pW3Rxp6(pa',
      name: 'Tactyks Easy',
    },
  ],
  vale: [
    {
      mdt: '!vwvtpYjmm0Fm9(QKqsGCSs7LEbvj65ODgMWo0YhvdW(XL(BVXb7SKmBp0dismo2VNF2bl3(dBZQ7TvBZJUUtBdR)5P1R3CU2RUL1h6NTnV6C)YwZFGzBU031136D6DBTamS1FX28I8Q76P5XXtJ(nNg2CqqB3UDZnT(9THbBndCgT0SDEW9IBaJjA9XTPNDZtF7YBE76qWxCdU21(5jF48473(iT4xwdyUUCFvDL3Zv)lClCWAHTUy3SbnZrZHpxe)mN95hJZr7QW(M25H5B2MV01jzDDGhcWbf6LC)ueKmPqINcfjMkfcfn8wcybwOGKNbozkiaiycGO4yHGlttRcZJolAQmkQVNIYGhsWbbvGyufKJ4wiqGlYlMLORvzzQmNhNR2lMQKmrfibvHeifuji(dIRsjEvoHakboOJnpCmOH0usPbXlbeoJqcNrqHZIYfxe1lOa4JU)RHyvcRGG5HKFf0o4vFVFHAihEinUiThrMQreHXcSo15i)1P83CF7I8JdepvzwxklBIPIiVHQpmsW5iZdTahvESZNl(8oxai7DUvhvCd1QA0yQmLyQmzJ3CAq9UHec)XCRUVmS3Tzo2gqS0KQ9hnVR7rzNuDbj6fKMlZqakBIur(q1WGcZojujJjrH64vtauYZIiNN0vu0C3)omaHuiF0iDktle)NhtLaQyhB61RrSAOrtVn3KB89VUS0)80O)3blH7892Np)t)pbOT2)ca',
      name: `Tactyks Easy`,
    },
  ],
  void: [
    {
      mdt: '!9v1spYjmm4Fm9(ksIjahR0EPxqvIEoQ7We2HUmq7aSpU0F71jeZqCx4cYXXp(S9xmgH5hMQj77tMQhTnpn3n93FoD5M1wFXoo9q7GP6nR9ftP4Het152MM2A0OpmLsNI52ZMQtVzV8NRDndyqE9PUzRlM1Z3Uz7N((CxNPmXzBqt18Po7R2UqidAFCU)z7q)3o)oQxRC3mA7S1tTd9y4Wi)BmsJOyPyZNsHZ0sjkaobfk4a2Kth3IWfP0fP0fAYvyXc9wxXZ50z)XQ6HUHBMQV00ajnnR5Q4ZTYztH3kveWdjxgYTIH6W1QW1bSRo2B4qVJaoC3bkNqWR04GXuler1j2wzNv71hoLV0Ts32hyrxTtsbwsszN17nIC166mvYCtLS)mBXTmNb6nGYLSSJNcICg4IzgLYKd9pAmTWCwcifw5MP72WlJ7z3ttcr0fXVrIQ3LzJpw57uV8Hs(o6lI9Ffizb7YdWOGxVfHUUW7HuZ6B5FsFlQkO3JlCuIywqLFsmhBlCIgRAYHSqIPirpsj2iTbrhdKIvwh94yX8848R55L3xP9rs2tmjCCJ4(Ijr0oNS4Dm649H)h7M4tcoVouhsQquR7BwzY(npak45gPOGVxPrbF3ndf89)CuWZhkqb)Ks48mzVLOlBcwFhlyBSL8Ia49ufd8aneb61bidGhubWdqa8abEGapqGhwbFAYERBfrR(48Y7ymLn3LS5o9lnyNvSOoBV96hFDCS95(R4)xh9)ef1pC6x4FvPJM)ba',
      name: `Tactyks Easy`,
    },
  ],
}

async function convertRouteDefinition({ name, mdt }: SampleRouteDefinition): Promise<SampleRoute> {
  const mdtRoute = await decodeRoute(mdt)
  const route = mdtRouteToRoute(mdtRoute)

  if (name) route.name = name

  return {
    route,
  }
}

export type SampleRoutes = Record<DungeonKey, SampleRoute[]>

/**
 * Only the hand-curated "easy" routes are compiled in. The WCL-ranked routes are published to
 * blob storage by the sync-rankings workflow and fetched at runtime (see src/api/rankingsApi.ts),
 * so refreshing them no longer requires a rebuild.
 */
const easySampleRoutes = dungeonKeys.reduce((acc, key) => {
  acc[key as DungeonKey] = []
  return acc
}, {} as SampleRoutes)

for (const dungeonKey of dungeonKeys) {
  for (const routeDefinition of sampleRouteDefinitions[dungeonKey]) {
    const sampleRoute = await convertRouteDefinition(routeDefinition)
    easySampleRoutes[dungeonKey].push(sampleRoute)
  }
}

export default async () => ({
  data: easySampleRoutes,
})

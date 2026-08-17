import type { SampleRoute } from '../../util/types.ts'
import { type DungeonKey, dungeonKeys } from '../dungeonKeys.ts'
import { decodeMdtString } from '../../util/mdt/mdt2.ts'
import { mdtRouteToRoute } from '../../util/mdtUtil.ts'

type SampleRouteDefinition = Omit<SampleRoute, 'route'> & {
  mdt: string
  name?: string
}

const sampleRouteDefinitions: Record<DungeonKey, SampleRouteDefinition[]> = {
  fang: [
    {
      mdt: '!~MDT2~XZHdTtswGIZnO3HaJE76Q6UdInE+VVM10UNEKwQ7GNO0C2jTz5Bhkimx+Tmr3cAFcAngcp1TVra0HNqvn+979fh1IuFO/pwAnykh9+VlAZBcQik/pfnkFuAKnS1SztNECXmPj1W6OLudFeLLFRx+LqY3M6Hg9WuiigIyea6E+PDt7fBDzQXcgEDf3y4mKruAPDtd3H20pyUISGSaZ8vpbyVE+bSmlUuJ4xnq+RoFq/7eYJrkIi9ODjgfDTm3SGOq214VDEL2L6qDcR0humoh7JlWe5saDddIO9SwyKv6e92er0lDzg85XyNNqAlCz0Sxr3HD1vRzpNH2otHQ4oco7iBMDMJhE9bRmFtcOS71iHbCZlLNcW7xKggZMX4QNg3q5qOhjTXqGoQHBm1BNfZCTBizFSb/94w3tdq7m/++ZBEzjvtOi/uIMHFc2tKIGT/YNWPdRxbFnW6vpTGrqNeY26ix1MQdXzusiuJef9eMRaae6jDT/NLG0EtHo/57M+eQwfX9UVmmF9k1ZLJcnuTzX5DIcvkH',
      name: 'Tactyks Easy',
    },
  ],
  kr: [
    {
      mdt: '!~MDT2~ZVBdT9RQEHXutt1PFlZARvxCgfBmmlgT+mjcDUEexBh/ANudC5W7LWnvRfZtp8EEX/0JbMG/aaqQbfVxZs45c8657Wu60F/6JI+M0hv6JCEKTijVr8O4/43oFD6MQinDwCg9Ee9NODoYe8nwNFVvJm93B+dHytDtQWCShCJ9aJR68PFu+GyGis5Jwae7Rd9ExxRH+6OL3n5KigIdxtF0cGaUSn/OIKtZ4gpEzbKdemMQxCpO9jal9Fwpc/G92Wp3uhYLO7Ps+2Nx8mVeY8tisC/rDXDKPM+9dhjm4OGulLMuw+J8KWUBnDUZWpfF67Ky5+Zthg7DQhnvub6c1RkaZeVC5nqpDPMLeo8B13/cR2ridgZiTvoTrMcC169a7c5Cd3Gph9vZ3IP/19tDBnxedSDlzXIGYiUT1mpm2bhT9eLLm2WurWbCWctsB3dYVFvJVxgeMaxV3BTl/MInDPiUAZ8x4CsG3GTArf/qQmTAl9WnnpvjYwZ8wYAb/xZ2SBGNJ+/SNDyOxhTpdLoXD79SoNPpbw==',
      name: 'Tactyks Easy',
    },
  ],
  murd: [
    {
      mdt: '!~MDT2~XZBLb9NAFIW5M+P3K255DCAkHhLsUBap2iwRiarSBUWIH9A4M63J1EaxHdpd7pBEXfMLkBrndyKXojRZ3nt0zj33W/VKcVl+6wl5WqnyZXk+FiI5F0X5Ps17P4UYwadhKmWaVKq8Ih+rdHg8qiaTvdF+NtxL+5NTVYnVcVKNxyIrTyqlHny+G75WAyUmQsGXu0Wvys5Enh0NL/mfo0IokZRpnk37Pyqlit8r0Mwg2jCppowhMxD6Sa7y8eEbKTttKWuYRa14h2rbMdHg79Z6o3ZlDWgSbdkUDXtGTSD37Z12DQtq2Q4QoimjGgi7HzA4kHIFcz8IXY/MHNfzqTYtC8HWzFgHNVHLRwhPEPjbzQKd9o2zAEKZYbp683hXLh8j8GfzW5k/3zRKWXua7/ODAK1Q206M5trcbQ6G2vUihNY1EGaYlu2s7U3AMtCu37p2PT8Io1Yco/Vf794Wrn0dtULtBxGynW2qNw8R+IttlktvAc0nVqiB7CLbQunN7QaRr4EGCKGmbJPk0v/FDDNCI8ZteL627EATurtu+Y9ezTkCf4rAXyHw15s9u/JEZOLi6kNRpGfZhcjKYnqYD76LpCymfwE=',
      name: 'Tactyks Easy',
    },
  ],
  nalo: [
    {
      mdt: '!~MDT2~ZZDLbtNAFIaZi2d8SxynNDWwQWKPvDASWSISVaULihAP0DgzrcPUbmK7pLucsV+ARwCS8JrIVZEddTPSzNH3/2e+/aQQ6+LbRMjLUhWvi+uVEPG1yIu3STb5IcR39GmeSJnEpSru8ccymZ8vlutlns0Wy3eL6d2lKsX+PC5XK5EWF6VSzz4/Xr6WMyXuhEJfHh8mZXolsvRsvg5+neVCibhIsnQzvS2Vyn/uERCsCSU1oQbzNcNBAGgaZypbnb6RMgql3GEwCXhUU+7VtjPw/4+b4Vj+RWBgsAgMKBCvZty0ggB4NyMK97hi3CC1ZXOTgunp4ZFfmZbdRs3eS/l70O1uyC3Wjkv06NjXjtvtjcI/VHt9VvtDhLtdY7ljFaEGrxgnpibUbjMbUMotqxg3TW0wS1OjZccyCvcGIKbdHgfDAm4DbtEG3g4BHQF63kaOH9bcOYBcjXAP0OiJPkdj4gLpVwiTk+Y49LdzNDVcoH2gJ0APtW1dMHoak5HuUg+qjp+oCl4ACl4CCl4d/jgKL0Qqbu4/5Hlyld6ItMg3p9lsIeIi3/wD',
      name: 'Tactyks Easy',
    },
  ],
  rlp: [
    {
      mdt: '!~MDT2~XVDLTsMwEMR23gmQlleOSNw4oIJANEdEKgQcACE+IE3XEDAJSmxoOdVp4YL4CFDod6LwUArHnZ2ZndlJwKHPLwKgoWB8lV9lANEV5HwjToMHgBt01IspjSPB+ADvi7h3vNNu7T6GO4zfhZ37kAmYHEciyyDhp4KxmZOf4Vx0GdwDQ2c/QCCSS0iTw17fWz/MgUHE4zQZdu4EY/nrB5IIj02ECRkbCBNFok6UsjQ7WKN0u0VpiSQmhaopkvwuKtinH1gaSqGb6shreZvelvZXud16q/ndNqXv+jShopRWoVu2VJxCM6e9q41EtiSOVKYtfVpaEjvSmKudKj6lpVUoqi2xUxCrVvjfN4hmS+QUCNear2LuuOrbeEaKqmHSrD39r3QTS5qO1N2RalqNp+W5+eZKU+J/z3EL3Wi82M7skm6YlruwuPA3mk9PIYHbwV6ex5fJLSQ8Hx6k3WuIeD78BA==',
      name: 'Tactyks Easy',
    },
  ],
  tos: [
    {
      mdt: '!~MDT2~VVDJbtNQFOU+288mQ+fSi0qhpMxQFKFIkCUiUVW6oKjiA5rkvcTEtavYDu0u54kFa36hwe1nIoeiOMs7nDFrJeoi+dZS+jQNkt1kMFKqO1Bx8taPWj+UGtLnnq+1302D5FJ8Sv3e0bD/fjg+H7wbjOL2+DRIVXbUTUcjFSbHaRDc+XI7nKSdQI1VQF9vF6007KsoPOxdbBzGKlDdxI/CSfs8DYL4d0bwBDwLwobnGGG1u1EQjQ72tG7Utc7IbDELrFpwbViOqZT+P+Tnpv5D2BSmumRBOnCK4Eb9ih+C+BFoDul80PqaULXgSJAL8kBcm39onUMzwpqEcGF5sLgGUdRs1K8lXBeuB1kGVWYEdlG5qTMJ6cL2jO1U4HANVpEhj4V11zjSg1s20q1AzvFN3ajfVEEboE1D4h5oC8S7IH5dTDJrZ8nYtGzIXjFOaR3E23OrzVmS6RLEsnHkyk8Slr3Y7ZTvg/gBiB8XiXMHV7wN4pfFXnLFKTOId0C8b0gstprfBO9A8L4pKs1crELy3swCv/rlSNe7WypXFku9WQPxExA/BfEzQ4Kfg/jFP9CbRSdNfaxCdXb5MY79fnimwiSeHESd76qbxJO/',
      name: 'Tactyks Easy',
    },
  ],
  vale: [
    {
      mdt: '!~MDT2~TY/Nb9NAEMXZtde7Xpvy1Y+hcEDiXuXgAzkiElWlB4oQZ3Cc3drt2i7xOrS3jNOCBP8Fqi3xXyKjVO5pNPPe72leN7Hq0n6eKB3Xxr6y6UKpJFWVPcjKyXelzsn7eaZ1ltTGXtF3dTY/XkapSuMyz+N8uoxNrbrjpF4sVGFPamMefNgsn+qZUUtlyMfNYVIXp6osjuaX8OeoUkYlNiuL1fSiNqb63XEUoqGOvybUkQ11AmTTpDTl4vC11tFI646hy9EXSPwbl3kykOjeOXp9rFuOW6JhnkQWoHefjka39Hp7Z3dPNlwEyAdu9kbrlq4B4DnsM/Q4PhIoBran/5I17MMLeEl/QQoZnMEFfINzMJBDAaWDxEXG0PGQcHws0L//VjTqOD4RKP2bp8+2d3Yl+uHweK+PdUuv4Qt8hRhmogkDiTIc2vchWrekET79KXwZhA+3QnT2kAwhYx2NbhlyvqaOGyId2J5uyQ/quMzjdDMZUq+hzp1r/L/liSpUfvW2qrLTIleFrVaH5exMJbZa/QM=',
      name: `Tactyks Easy`,
    },
  ],
  void: [
    {
      mdt: '!~MDT2~VZBLb9NAFIWZ8YzjJLYTO1F6QQgK5f0oAWVBlohEVcuCItQf0DgzjWFiQ2z3scsd77rhP1Dq/k3kUhRnd+7VPee7OsUoFafpwUjIw0ylm+lsIUQwE0m6HcajEyG+k71pKGUYZCo9ox+zcLo3ORGzn3Ml43R8fKgyUXwKssVCROl+ptStzzfD12yixLFQ5MvNYpRFRyKOdqencLGbCCWCNIyj5fhHplTyqyC549pUOzbPW23XRMdCMg5iFS92tqQc9KX8XV9tynkoL0lOqEFzYlCjVKxUVdOgX1DNONOMN5HYSJxqxOS9lAXRjBuacRdJC0m7Ci0TLuA2Eri3Th70CxOZVyJ9JB0k3VJWwUP5x9fU6GjKu3mjaVfdUhYWMk8z7mvGO8i6ec2qr9zDa+wdJHBXE7pylt6C6nrD0DXL022vhwaA5ub/k+H1x1cELQNND1s+uj0kAJWUf01eEaxRNHn5he34aG2cw33YhAfwELbgETyGJ/AUnq2XXXBsmmh76ProbJzDa3gOL+AlvIJteAN9eAvv1qu/JLre8LHVQwqgDbZe/L6IxPzsQ5KER9FcRGmy3Ikn30SQJsu/',
      name: `Tactyks Easy`,
    },
  ],
}

async function convertRouteDefinition({ name, mdt }: SampleRouteDefinition): Promise<SampleRoute> {
  const mdtRoute = await decodeMdtString(mdt)
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

import { WclEvent, WclRoute } from '../src/util/wclUtil.ts'

const token =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5YjgzMmFjMC05OTE3LTRjMzgtOTVhMy1kNmRkOTIwOTM5YzMiLCJqdGkiOiIxZjI0NGVmN2RlZGY2YTg3YTUwMjUyZWI5YTRkZGZhYzdjMDI0ZDU1YTE5ODU2MDgzMjMxMjIxMzhjOWRiMDJjMDYzOGZjZGExOGNlZmQzMiIsImlhdCI6MTcwOTg3NzY0NC40MzMzNjksIm5iZiI6MTcwOTg3NzY0NC40MzMzNzMsImV4cCI6MTc0MDk4MTY0NC40MjUxNTgsInN1YiI6IiIsInNjb3BlcyI6WyJ2aWV3LXVzZXItcHJvZmlsZSIsInZpZXctcHJpdmF0ZS1yZXBvcnRzIl19.Ja9sun9mng7q_KbszrB5Cq-viYk3aWQ9qVx5vEq-q_06xYP1VNwjcPsLOXxUHpueokI9HKgtPoa4N2THj6Tuhgv8O8y5sL7K7zO6XEwOjTpvf3CUnCob4FcHOsBq8ARUGk_DTs38eYeXBkHLX_6aoCIOE6pkUQA-5nA2Rj7b5iZ8LE1mLuloDMnQx2od45wKUQoe57uuabY8yGP1J5pRJQD53jM8t7IV2I4I_oatVi9MtsuLqPjJWZh4q_f59UvZU4dhEn9ab3K7XO8iesO4KGf9VYWsOxz0aY-TwO19j4bt6iZ1Zv147PK2BzoQ9YkeVvuHY5SY92mfeK7Eeoqq69lpsd2wiw3BAsdYTPh9YLtxL3TEJCQXBrVtfWrTuhg5RbwWm_FsPLtCq-LIb6sfhKlvpVFGc9zsBqh8rnFhLYgd9jpGiexgXjF3rTto-rpEimNt7bLmLkl8SNJixYJBSbdIHdLIykQwDsbjdJtQzDGrF61j5-Sx6gmks1qPcW1AV_y0dz8TCjrZjg9F6DCJzYqmQMvrYc_RmEY3e72AJszaxCwadDvP2v_-2abiF51jdHd6QMvieIkIWHeVQdwzf4H6ww19hVNEJg3n8TDAeJNNWjuaabtZrC9HudAzrruQDxtjTKvrd6q7uPDHA66-58Wd1SXPyGylJ4VIMPZreF4'

async function getRoute(code: string, fightId: string | number) {
  const query = `
query {
  reportData {
    report(code:"${code}") {
      fights(fightIDs:${fightId}) {
        encounterID
        keystoneLevel
        dungeonPulls {
          enemyNPCs {
            id
            gameID
            minimumInstanceID
            maximumInstanceID
          }
        } 
      }
    }
  }
}
`

  const data = await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  })

  const json = await data.json()

  return json.data.reportData.report.fights[0] as WclRoute
}

async function getFirstEvents(
  code: string,
  fightId: string | number,
  enemies: Array<{ gameID: number; instanceId: number }>,
) {
  const matches = enemies
    .slice(0, 50)
    .map(({ gameID, instanceId }) => {
      return `matched (target.id=${gameID} and target.instance=${instanceId}) in (1) end`
    })
    .filter(Boolean)

  console.log(matches.join('\n'))

  const filter = matches.join(' or ')

  const query = `
query {
  reportData {
    report(code:"${code}") {
      events(
        fightIDs: ${fightId}
        # includeResources: true
        filterExpression: "${filter}"
      ) {
        nextPageTimestamp
        data
      }
    }
  }
}`
  console.log(query)

  const data = await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  })

  const json = await data.json()

  return json.data.reportData.report.events.data as WclEvent[]
}

export async function getWclRoute(code: string, fightId: string | number) {
  const wclRoute = await getRoute(code, fightId)

  const enemies = wclRoute.dungeonPulls.flatMap(({ enemyNPCs }) =>
    enemyNPCs.flatMap(({ id, gameID, minimumInstanceID, maximumInstanceID }) =>
      Array.from({ length: maximumInstanceID - minimumInstanceID + 1 }, (_, i) => ({
        id,
        gameID,
        instanceId: minimumInstanceID + i,
      })),
    ),
  )

  const firstEvents = await getFirstEvents(code, fightId, enemies)
  console.log(firstEvents)
}

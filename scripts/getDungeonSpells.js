import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const token =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5YjgzMmFjMC05OTE3LTRjMzgtOTVhMy1kNmRkOTIwOTM5YzMiLCJqdGkiOiIxZjI0NGVmN2RlZGY2YTg3YTUwMjUyZWI5YTRkZGZhYzdjMDI0ZDU1YTE5ODU2MDgzMjMxMjIxMzhjOWRiMDJjMDYzOGZjZGExOGNlZmQzMiIsImlhdCI6MTcwOTg3NzY0NC40MzMzNjksIm5iZiI6MTcwOTg3NzY0NC40MzMzNzMsImV4cCI6MTc0MDk4MTY0NC40MjUxNTgsInN1YiI6IiIsInNjb3BlcyI6WyJ2aWV3LXVzZXItcHJvZmlsZSIsInZpZXctcHJpdmF0ZS1yZXBvcnRzIl19.Ja9sun9mng7q_KbszrB5Cq-viYk3aWQ9qVx5vEq-q_06xYP1VNwjcPsLOXxUHpueokI9HKgtPoa4N2THj6Tuhgv8O8y5sL7K7zO6XEwOjTpvf3CUnCob4FcHOsBq8ARUGk_DTs38eYeXBkHLX_6aoCIOE6pkUQA-5nA2Rj7b5iZ8LE1mLuloDMnQx2od45wKUQoe57uuabY8yGP1J5pRJQD53jM8t7IV2I4I_oatVi9MtsuLqPjJWZh4q_f59UvZU4dhEn9ab3K7XO8iesO4KGf9VYWsOxz0aY-TwO19j4bt6iZ1Zv147PK2BzoQ9YkeVvuHY5SY92mfeK7Eeoqq69lpsd2wiw3BAsdYTPh9YLtxL3TEJCQXBrVtfWrTuhg5RbwWm_FsPLtCq-LIb6sfhKlvpVFGc9zsBqh8rnFhLYgd9jpGiexgXjF3rTto-rpEimNt7bLmLkl8SNJixYJBSbdIHdLIykQwDsbjdJtQzDGrF61j5-Sx6gmks1qPcW1AV_y0dz8TCjrZjg9F6DCJzYqmQMvrYc_RmEY3e72AJszaxCwadDvP2v_-2abiF51jdHd6QMvieIkIWHeVQdwzf4H6ww19hVNEJg3n8TDAeJNNWjuaabtZrC9HudAzrruQDxtjTKvrd6q7uPDHA66-58Wd1SXPyGylJ4VIMPZreF4'

export async function getDungeonSpells({ code, fightId, dungeonKey }) {
  const toQuery = (startTime) => `
query {
  reportData {
    report(code:"${code}") {
      events(fightIDs:${fightId},
             dataType:Casts,
             hostilityType:Enemies,
             useAbilityIDs:false,
             useActorIDs:false,
             startTime:${startTime},
             endTime:999999999) 
      {
        nextPageTimestamp,
        data,
      }
    }
  }
}
`

  const spells = {}
  const ids = new Set()
  let nextTimestamp = 0

  while (nextTimestamp !== null) {
    const data = await fetch('https://www.warcraftlogs.com/api/v2/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: toQuery(nextTimestamp) }),
    })

    const json = await data.json()
    const events = json.data.reportData.report.events.data
    nextTimestamp = json.data.reportData.report.events.nextPageTimestamp

    for (const event of events) {
      const spellId = event.ability.guid
      if (ids.has(spellId)) continue

      ids.add(spellId)

      const spell = {
        id: spellId,
        name: event.ability.name,
        icon: event.ability.abilityIcon,
      }

      spells[event.source.guid] ??= []
      spells[event.source.guid].push(spell)
    }
  }

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const file = `${__dirname}/../src/data/spells/${dungeonKey}_spells.json`
  fs.writeFileSync(file, JSON.stringify(spells))
  console.log(`Wrote to ${file}`)
}

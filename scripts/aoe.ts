import fs from 'fs/promises'
import { getDirname } from '../server/files.ts'
import type { Spell } from '../src/data/types.ts'
import mot from '../src/data/spells/mot/motSpells.ts'
import { getGrimoireSpell } from 'grimoire-wow'

const dungeons = [mot]

const dirname = getDirname(import.meta.url)

const allSpells: Spell[] = []
for (const dungeon of dungeons) {
  const { data } = await dungeon()
  allSpells.push(
    ...Object.values(data).flatMap((spells) => spells.map((spell) => getGrimoireSpell(spell.id))),
  )
}

await fs.writeFile(`${dirname}/spells.json`, JSON.stringify(allSpells, null, 2), 'utf-8')

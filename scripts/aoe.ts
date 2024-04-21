import fs from 'fs/promises'
import { getDirname } from '../server/files.ts'
import type { Spell } from '../src/data/types.ts'

import aa from '../src/data/spells/aa/aaSpells.ts'
import av from '../src/data/spells/av/avSpells.ts'
import bh from '../src/data/spells/bh/bhSpells.ts'
import hoi from '../src/data/spells/hoi/hoiSpells.ts'
import nelth from '../src/data/spells/nelth/nelthSpells.ts'
import nok from '../src/data/spells/nok/nokSpells.ts'
import rlp from '../src/data/spells/rlp/rlpSpells.ts'
import uld from '../src/data/spells/uld/uldSpells.ts'
import { getGrimoireSpell } from 'grimoire-wow'

const dungeons = [aa, av, bh, hoi, nelth, nok, rlp, uld]

const dirname = getDirname(import.meta.url)

const allSpells: Spell[] = []
for (const dungeon of dungeons) {
  const { data } = await dungeon()
  allSpells.push(
    ...Object.values(data).flatMap((spells) => spells.map((spell) => getGrimoireSpell(spell.id))),
  )
}

await fs.writeFile(`${dirname}/spells.json`, JSON.stringify(allSpells, null, 2), 'utf-8')

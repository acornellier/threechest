import { getDirname } from '../server/files.ts'
import fs from 'fs/promises'

const dirname = getDirname(import.meta.url)

const data = await fetch('https://keyandheal.com/page-data/dungeons/SpellBank/page-data.json')
const spellBank = await data.json()

await fs.writeFile(
  `${dirname}/../src/data/spells/spellBank.json`,
  JSON.stringify(spellBank, null, 2),
  'utf-8',
)

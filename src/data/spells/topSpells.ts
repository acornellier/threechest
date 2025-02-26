import { mergeSpells } from './grimoire.ts'

export default async () => ({
  data: mergeSpells('top'),
})

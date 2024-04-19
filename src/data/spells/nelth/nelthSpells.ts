import spells from './nelth_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {
  181861: [375449], // Elephant boss - Charge
  189340: [374482, 414585], // Chargath - Grounding Chain, Fiery Demise
  189901: [391762], // Final boss intermission damage, curse
}

const removedSpells: number[] = [
  375436, // Elephant Charge
  373762, // Chargath Magma Wave
  373767, // Chargath Magma Wave
  373424, // Chargath Grounding Spear
  375057, // Chargath Grounding Spear
  396424, // Chargath Grounding Spear
  375055, // Chargath Fiery Focus
  384019, // Chargath Fiery Focus
  396332, // Chargath Fiery Focus
  437458, // Chargath Fiery Focus
  374812, // Forgemaster Blazing Aegis
  374812, // Forgemaster Blazing Aegis
  374842, // Forgemaster Blazing Aegis
  392666, // Forgemaster Blazing Aegis
  377995, // Forgemaster Forgestorm
  374534, // Forgemaster Heated Swings
  374535, // Forgemaster Heated Swings
  375306, // Forgemaster Heated Swings
  374635, // Forgemaster Might of the Forge
]

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, extraSpells, removedSpells),
})

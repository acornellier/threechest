/**
 * Long-duration CC used to hold a mob out of a pull and take it later. These are the *debuff*
 * ability ids, not the cast ids — Freezing Trap is cast as 187650 but applies aura 3355, and every
 * Polymorph / Hex shape variant applies its own aura id.
 *
 * Kept free of `import.meta.compileTime` so both the server (to build the WCL filter expression)
 * and the client (to render the icon) can import it. Icon names are hardcoded rather than read
 * from grimoire-wow, which is 80MB and must not reach the bundle.
 */

export type CcSpell = {
  name: string
  icon: string
}

export const ccSpells: Record<number, CcSpell | undefined> = {
  115078: { name: 'Paralysis', icon: 'ability_monk_paralysis' },

  118: { name: 'Polymorph', icon: 'spell_nature_polymorph' },
  28271: { name: 'Polymorph', icon: 'ability_hunter_pet_turtle' },
  28272: { name: 'Polymorph', icon: 'spell_magic_polymorphpig' },
  61025: { name: 'Polymorph', icon: 'spell_nature_guardianward' },
  61305: { name: 'Polymorph', icon: 'achievement_halloween_cat_01' },
  61721: { name: 'Polymorph', icon: 'spell_magic_polymorphrabbit' },
  61780: { name: 'Polymorph', icon: 'achievement_worldevent_thanksgiving' },
  126819: { name: 'Polymorph', icon: 'inv_pet_porcupine' },
  161353: { name: 'Polymorph', icon: 'inv_pet_babyblizzardbear' },
  161354: { name: 'Polymorph', icon: 'ability_hunter_aspectofthemonkey' },
  161355: { name: 'Polymorph', icon: 'inv_misc_penguinpet' },
  161372: { name: 'Polymorph', icon: 'inv_pet_peacock_gold' },
  277787: { name: 'Polymorph', icon: 'inv_pet_direhorn' },
  277792: { name: 'Polymorph', icon: 'inv_bee_default' },
  321395: { name: 'Polymorph', icon: 'inv_mawrat' },
  391622: { name: 'Polymorph', icon: 'inv_duckbaby_mallard' },

  51514: { name: 'Hex', icon: 'spell_shaman_hex' },
  210873: { name: 'Hex', icon: 'ability_hunter_pet_raptor' },
  211004: { name: 'Hex', icon: 'ability_hunter_pet_spider' },
  211010: { name: 'Hex', icon: 'inv_pet_pythonblack' },
  211015: { name: 'Hex', icon: 'inv_pet_cockroach' },
  269352: { name: 'Hex', icon: 'ability_mount_fossilizedraptor' },
  277778: { name: 'Hex', icon: 'inv_zandalaribabyraptorred' },
  277784: { name: 'Hex', icon: 'inv_wickerbeastpet' },
  309328: { name: 'Hex', icon: 'ability_creature_amber_02' },

  6770: { name: 'Sap', icon: 'ability_sap' },
  3355: { name: 'Freezing Trap', icon: 'spell_frost_chainsofice' },
  9484: { name: 'Shackle Undead', icon: 'spell_nature_slow' },
  710: { name: 'Banish', icon: 'spell_shadow_cripple' },
  217832: { name: 'Imprison', icon: 'ability_demonhunter_imprison' },
  20066: { name: 'Repentance', icon: 'spell_holy_prayerofhealing' },
  2094: { name: 'Blind', icon: 'spell_shadow_mindsteal' },
  2637: { name: 'Hibernate', icon: 'spell_nature_sleep' },
  19386: { name: 'Wyvern Sting', icon: 'inv_spear_02' },
  // grimoire-wow reports this icon with a space; the real CDN filename is hyphenated.
  82691: { name: 'Ring of Frost', icon: 'spell_frost_ring-of-frost' },
  360806: { name: 'Sleep Walk', icon: 'ability_xavius_dreamsimulacrum' },
  1513: { name: 'Scare Beast', icon: 'ability_druid_cower' },
  10326: { name: 'Turn Evil', icon: 'ability_paladin_turnevil' },
  6358: { name: 'Seduction', icon: 'spell_shadow_seduction' },
}

export const ccSpellIds = Object.keys(ccSpells).map(Number)

/** Split from spellCooldowns.ts so scripts can import the type without the data table. */
export type SpellCooldown = {
  /** Seconds between required kicks, or null to exclude the spell from interrupt math. */
  cooldown: number | null
  note?: string
}

export type SpellCooldowns = Record<number, SpellCooldown | undefined>

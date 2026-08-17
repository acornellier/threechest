import { describe, expect, test } from 'vitest'

import { base64ToBytes, inflateRaw } from './binary.ts'
import { decodeCbor, encodeCbor } from './cbor.ts'
import { decodeMdtString, encodeMdtString } from './mdt2.ts'
import { pullsOnly, withDrawings } from './__fixtures__/mdtStrings.ts'

const fixtures = { pullsOnly, withDrawings }

const rawCbor = (str: string) => inflateRaw(base64ToBytes(str.slice('!~MDT2~'.length)))

describe.each(Object.entries(fixtures))('%s', (_name, mdtString) => {
  test('decodes to a route', async () => {
    const route = await decodeMdtString(mdtString)

    expect(route.value.currentDungeonIdx).toBe(162)
    expect(route.value.pulls.length).toBeGreaterThan(0)
    expect(typeof route.text).toBe('string')
  })

  /**
   * The strongest guarantee available without running WoW. Byte length matching proves we pick the
   * same integer and float widths Blizzard does for every value; the tree comparison proves nothing
   * is lost. The bytes themselves differ only in map key order, which CBOR does not consider
   * significant — Lua emits keys in pairs() order while JS sorts integer-like keys.
   */
  test('re-encodes to equivalent CBOR', async () => {
    const original = await rawCbor(mdtString)
    const reEncoded = encodeCbor(decodeCbor(original))

    expect(reEncoded.length).toBe(original.length)
    expect(decodeCbor(reEncoded)).toEqual(decodeCbor(original))
  })

  test('survives a full string round trip', async () => {
    const route = await decodeMdtString(mdtString)

    expect(await decodeMdtString(await encodeMdtString(route))).toEqual(route)
  })
})

test('parses notes and drawings', async () => {
  const route = await decodeMdtString(withDrawings)
  const objects = route.objects as Record<string, unknown>[]

  const note = objects.find((object) => 'n' in object)!
  expect(note.d).toEqual([439.34228643187413, -383.65720449140133, 1, true, 'THIS IS A NOTE'])

  const drawing = objects.find((object) => 'l' in object)!
  expect((drawing.l as string[])[0]).toBe('495.4')
})

test('rejects a pre-6.2 string with an actionable message', async () => {
  await expect(decodeMdtString('!fw1YUrkmqWpMCpI2gm4JRuUKlOvIC2ANHXKqcbwXJ84Y')).rejects.toThrow(
    /older version of MythicDungeonTools/,
  )
})

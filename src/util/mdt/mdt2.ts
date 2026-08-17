/**
 * MDT's `!~MDT2~` string format, introduced in MDT 6.2: CBOR, raw deflate, then base64. See
 * MythicDungeonTools/Modules/Transmission.lua. Every layer has a native browser equivalent, so
 * unlike the AceSerializer format it replaced this needs no server round-trip.
 */

import type { MdtRoute } from '../types.ts'
import { base64ToBytes, bytesToBase64, deflateRaw, inflateRaw } from './binary.ts'
import { decodeCbor, encodeCbor } from './cbor.ts'

const prefix = '!~MDT2~'

export class MdtDecodingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MdtDecodingError'
  }
}

export async function decodeMdtString(str: string): Promise<MdtRoute> {
  const trimmed = str.trim()

  if (!trimmed.startsWith(prefix)) {
    throw new MdtDecodingError(
      'This route was exported by an older version of MythicDungeonTools. Update the addon and export it again.',
    )
  }

  let decoded: unknown
  try {
    decoded = decodeCbor(await inflateRaw(base64ToBytes(trimmed.slice(prefix.length))))
  } catch {
    throw new MdtDecodingError('Invalid MDT string')
  }

  if (typeof decoded !== 'object' || decoded === null || !('value' in decoded)) {
    throw new MdtDecodingError('Invalid MDT string')
  }

  return decoded as MdtRoute
}

export async function encodeMdtString(mdtRoute: MdtRoute): Promise<string> {
  return prefix + bytesToBase64(await deflateRaw(encodeCbor(mdtRoute)))
}

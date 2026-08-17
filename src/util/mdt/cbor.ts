/**
 * CBOR codec covering the subset emitted by Blizzard's C_EncodingUtil, which MDT 6.2+ uses for
 * its `!~MDT2~` exports. Blizzard writes Lua strings as byte strings (major type 2) rather than
 * text strings, which off-the-shelf decoders either reject outright or surface as byte arrays.
 *
 * Lua tables map to CBOR the way Blizzard's serializer writes them: sequences become arrays and
 * everything else becomes a map. Since Lua distinguishes t[7] from t["7"], object keys that look
 * like integers are written as integers on the way out.
 */

const MAJOR_UINT = 0
const MAJOR_NEGINT = 1
const MAJOR_BYTES = 2
const MAJOR_TEXT = 3
const MAJOR_ARRAY = 4
const MAJOR_MAP = 5
const MAJOR_SIMPLE = 7

const SIMPLE_FALSE = 20
const SIMPLE_TRUE = 21
const SIMPLE_NULL = 22
const SIMPLE_UNDEFINED = 23
const SIMPLE_FLOAT16 = 25
const SIMPLE_FLOAT32 = 26
const SIMPLE_FLOAT64 = 27

export class CborError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CborError'
  }
}

const integerKey = /^(0|-?[1-9][0-9]*)$/

function decodeFloat16(bits: number): number {
  const sign = bits & 0x8000 ? -1 : 1
  const exponent = (bits >> 10) & 0x1f
  const fraction = bits & 0x3ff

  if (exponent === 0) {
    return sign * 2 ** -24 * fraction
  }
  if (exponent === 0x1f) {
    return fraction ? NaN : sign * Infinity
  }
  return sign * 2 ** (exponent - 15) * (1 + fraction / 1024)
}

export function decodeCbor(bytes: Uint8Array): unknown {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const textDecoder = new TextDecoder()
  let pos = 0

  function readCount(info: number): number {
    if (info < 24) {
      return info
    }
    if (info === 24) {
      const value = view.getUint8(pos)
      pos += 1
      return value
    }
    if (info === 25) {
      const value = view.getUint16(pos)
      pos += 2
      return value
    }
    if (info === 26) {
      const value = view.getUint32(pos)
      pos += 4
      return value
    }
    if (info === 27) {
      const value = view.getBigUint64(pos)
      pos += 8
      if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new CborError(`Integer ${value} exceeds safe range`)
      }
      return Number(value)
    }
    throw new CborError(`Unsupported additional info ${info}`)
  }

  function readString(length: number): string {
    const value = textDecoder.decode(bytes.subarray(pos, pos + length))
    pos += length
    return value
  }

  function readValue(): unknown {
    if (pos >= bytes.length) {
      throw new CborError('Unexpected end of input')
    }

    const initial = bytes[pos]!
    pos += 1
    const major = initial >> 5
    const info = initial & 31

    switch (major) {
      case MAJOR_UINT:
        return readCount(info)
      case MAJOR_NEGINT:
        return -1 - readCount(info)
      case MAJOR_BYTES:
      case MAJOR_TEXT:
        return readString(readCount(info))
      case MAJOR_ARRAY: {
        const length = readCount(info)
        const array: unknown[] = []
        for (let i = 0; i < length; i++) {
          array.push(readValue())
        }
        return array
      }
      case MAJOR_MAP: {
        const length = readCount(info)
        const map: Record<string, unknown> = {}
        for (let i = 0; i < length; i++) {
          const key = readValue()
          if (typeof key !== 'string' && typeof key !== 'number') {
            throw new CborError(`Unsupported map key of type ${typeof key}`)
          }
          map[key] = readValue()
        }
        return map
      }
      case MAJOR_SIMPLE:
        switch (info) {
          case SIMPLE_FALSE:
            return false
          case SIMPLE_TRUE:
            return true
          case SIMPLE_NULL:
          case SIMPLE_UNDEFINED:
            return null
          case SIMPLE_FLOAT16:
            return decodeFloat16(readCount(info))
          case SIMPLE_FLOAT32: {
            const value = view.getFloat32(pos)
            pos += 4
            return value
          }
          case SIMPLE_FLOAT64: {
            const value = view.getFloat64(pos)
            pos += 8
            return value
          }
          default:
            throw new CborError(`Unsupported simple value ${info}`)
        }
      default:
        throw new CborError(`Unsupported major type ${major}`)
    }
  }

  const value = readValue()
  if (pos !== bytes.length) {
    throw new CborError(`Trailing data: consumed ${pos} of ${bytes.length} bytes`)
  }
  return value
}

export function encodeCbor(value: unknown): Uint8Array {
  const chunks: Uint8Array[] = []
  const textEncoder = new TextEncoder()
  let length = 0

  function push(chunk: Uint8Array) {
    chunks.push(chunk)
    length += chunk.length
  }

  function writeHead(major: number, count: number) {
    if (count < 24) {
      push(new Uint8Array([(major << 5) | count]))
    } else if (count < 0x100) {
      push(new Uint8Array([(major << 5) | 24, count]))
    } else if (count < 0x10000) {
      const chunk = new Uint8Array(3)
      chunk[0] = (major << 5) | 25
      new DataView(chunk.buffer).setUint16(1, count)
      push(chunk)
    } else if (count < 0x100000000) {
      const chunk = new Uint8Array(5)
      chunk[0] = (major << 5) | 26
      new DataView(chunk.buffer).setUint32(1, count)
      push(chunk)
    } else {
      const chunk = new Uint8Array(9)
      chunk[0] = (major << 5) | 27
      new DataView(chunk.buffer).setBigUint64(1, BigInt(count))
      push(chunk)
    }
  }

  function writeNumber(num: number) {
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
      const chunk = new Uint8Array(9)
      chunk[0] = (MAJOR_SIMPLE << 5) | SIMPLE_FLOAT64
      new DataView(chunk.buffer).setFloat64(1, num)
      push(chunk)
    } else if (num >= 0) {
      writeHead(MAJOR_UINT, num)
    } else {
      writeHead(MAJOR_NEGINT, -1 - num)
    }
  }

  function writeString(str: string) {
    const encoded = textEncoder.encode(str)
    writeHead(MAJOR_BYTES, encoded.length)
    push(encoded)
  }

  function writeValue(val: unknown) {
    if (val === null || val === undefined) {
      push(new Uint8Array([(MAJOR_SIMPLE << 5) | SIMPLE_NULL]))
    } else if (typeof val === 'boolean') {
      push(new Uint8Array([(MAJOR_SIMPLE << 5) | (val ? SIMPLE_TRUE : SIMPLE_FALSE)]))
    } else if (typeof val === 'number') {
      writeNumber(val)
    } else if (typeof val === 'string') {
      writeString(val)
    } else if (Array.isArray(val)) {
      writeHead(MAJOR_ARRAY, val.length)
      for (const entry of val) {
        writeValue(entry)
      }
    } else if (typeof val === 'object') {
      const entries = Object.entries(val).filter(([, entry]) => entry !== undefined)
      writeHead(MAJOR_MAP, entries.length)
      for (const [key, entry] of entries) {
        if (integerKey.test(key)) {
          writeNumber(Number(key))
        } else {
          writeString(key)
        }
        writeValue(entry)
      }
    } else {
      throw new CborError(`Cannot encode value of type ${typeof val}`)
    }
  }

  writeValue(value)

  const result = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}

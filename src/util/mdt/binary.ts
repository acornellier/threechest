/** Base64 and raw-deflate helpers shared by the MDT2 and legacy string codecs. */

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  // Chunked to keep the argument list within the engine's apply() limit for large routes.
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

async function runStream(bytes: Uint8Array, stream: ReadableWritablePair): Promise<Uint8Array> {
  const response = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream))
  return new Uint8Array(await response.arrayBuffer())
}

export function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  return runStream(bytes, new CompressionStream('deflate-raw'))
}

export function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  return runStream(bytes, new DecompressionStream('deflate-raw'))
}

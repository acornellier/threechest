const _6bit_to_byte = {
  97: 0,
  98: 1,
  99: 2,
  100: 3,
  101: 4,
  102: 5,
  103: 6,
  104: 7,
  105: 8,
  106: 9,
  107: 10,
  108: 11,
  109: 12,
  110: 13,
  111: 14,
  112: 15,
  113: 16,
  114: 17,
  115: 18,
  116: 19,
  117: 20,
  118: 21,
  119: 22,
  120: 23,
  121: 24,
  122: 25,
  65: 26,
  66: 27,
  67: 28,
  68: 29,
  69: 30,
  70: 31,
  71: 32,
  72: 33,
  73: 34,
  74: 35,
  75: 36,
  76: 37,
  77: 38,
  78: 39,
  79: 40,
  80: 41,
  81: 42,
  82: 43,
  83: 44,
  84: 45,
  85: 46,
  86: 47,
  87: 48,
  88: 49,
  89: 50,
  90: 51,
  48: 52,
  49: 53,
  50: 54,
  51: 55,
  52: 56,
  53: 57,
  54: 58,
  55: 59,
  56: 60,
  57: 61,
  40: 62,
  41: 63,
}

function decodeForPrint(str) {
  const utf8Encode = new TextEncoder()
  if (typeof str !== 'string' || !str instanceof String) {
    console.error('The argument provided is not a string')
    return
  }

  str = str.replace('^[%c ]+', '')
  str = str.replace('[%c ]+$', '')

  const strlen = str.length
  if (strlen === 1) {
    console.error('String length is smaller than 1')
    return
  }

  const strlenMinus3 = strlen - 3
  let i = 0
  const buffer = []
  let cache = 0

  while (i <= strlenMinus3) {
    let [x1, x2, x3, x4] = utf8Encode.encode(str.substring(i, i + 4))

    x1 = _6bit_to_byte[x1]
    x2 = _6bit_to_byte[x2]
    x3 = _6bit_to_byte[x3]
    x4 = _6bit_to_byte[x4]
    if (x1 === undefined || x2 === undefined || x3 === undefined || x4 === undefined) {
      console.error('At least one of the four bytes is missing', x1, x2, x3, x4)
      return
    }
    i = i + 4
    let cache = x1 + x2 * 64 + x3 * 4096 + x4 * 262144
    const b1 = cache % 256
    cache = (cache - b1) / 256
    const b2 = cache % 256
    const b3 = (cache - b2) / 256
    String.fromCharCode(b1)

    buffer.push(String.fromCharCode(b1) + String.fromCharCode(b2) + String.fromCharCode(b3))
  }
  let cache_bitlen = 0
  while (i < strlen) {
    let [x] = utf8Encode.encode(str.substring(i, i + 1))

    x = _6bit_to_byte[x]
    if (!x) {
      console.error('A byte is missing', x)
      return
    }
    cache = cache + x * Math.pow(2, cache_bitlen)
    cache_bitlen = cache_bitlen + 6
    i = i + 1
  }

  while (cache_bitlen >= 8) {
    const byte = cache % 256
    buffer.push(String.fromCharCode(byte))
    cache = (cache - byte) / 256
    cache_bitlen = cache_bitlen - 8
  }
  return buffer.join('')
}

const encodedString =
  'LrvxpYnimW)sbY3pET9HE9b6jXP(OLYUlCk9stA3LC96)(ITjSaNuu2n2W4XJhaeWZG(YS1oFEFX9pqjQa9(8fq)vZM(H5)m)TtNa90LlBR)WC9282kOAevTGE70pnND38a4a9Btl7geRZ7xVAwDpTVS4bl(TE)0I5ndh73(K4(uc6vd)xvlOKGQZdNsicX6Oy9GQguduM2qgj9iOm1ifoVTSDf0wBTXAXLkj(WrXyJMeGBiWAIFHGHW4WFEodT609jJR8ovYX6yrewCqrwhkOLlJl3LWYXa3BZ4G9eXH6WwQZaqMY9UIEM2xxsPCOA(mkM4CtnMPZTX0cQHi2s6lwouLeCx4Dj4w6PNb6zSyg4vBhxg(LG1eQIUmoYD8yMsnY1UkJqmjfThaNwWrwIogc9PnxpTVbU79yMkrKzjqQdJ3r2jblG9rDpk2Oi0emRJLCMTKy(M7UAESpelKSWLH0OyqDmWl9vQ6K1PAs)OnJQImE4kpnC4Aln7rRzWV2L0rsULenSNPMv3GB)4er5HQc)DKY1PuUl9Cd7zpsna8TajTUmT15PstMHGoZGi1dF8irSdLbRb1GSfFKAWAMr40eV9PIwKGNYH4YwoIiC8q2X)x2Z6tFqbhyjuogATHcjNUxQQy0pwWAu2ompU41QFzF9fZ26JxE3xUEq7mMFnV(c4VY(MzXF9mEF9DG1xNTUVBT3mo((3Q7i6mV7F)WRtHY(00IX5mpUA3qQmT72(mghH)tfRblpP()1yEf4JTW))'
const decodedString = decodeForPrint(encodedString)

console.log(decodedString)

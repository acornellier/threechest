import { nouns } from './nouns.ts'
import { adjectives } from './adjectives.ts'

export const randomAdjective = () => adjectives[Math.floor(Math.random() * adjectives.length)]
export const randomNoun = () => nouns[Math.floor(Math.random() * nouns.length)]

export const generateCollabName = () => `${randomAdjective()} ${randomNoun()}`
export const generateCollabRoom = () => `${randomAdjective()}-${randomAdjective()}-${randomNoun()}`

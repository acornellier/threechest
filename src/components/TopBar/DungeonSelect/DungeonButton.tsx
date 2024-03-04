import { Button } from '../../Common/Button.tsx'
import { Dungeon } from '../../../data/types.ts'
import { ReactNode } from 'react'

interface Props {
  dungeon: Dungeon
  onClick: () => void
  children?: ReactNode
  dropdown?: boolean
  expanded?: boolean
}

export function DungeonButton({ dungeon, onClick, children, expanded, ...props }: Props) {
  return (
    <Button
      twoDimensional
      className="flex gap-2 py-2 px-2 min-w-[250px]"
      style={{
        ...(expanded
          ? {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }
          : {}),
      }}
      onClick={onClick}
      {...props}
    >
      <img
        className="rounded border-2 border-gray-600"
        height={36}
        width={36}
        src={`https://wow.zamimg.com/images/wow/icons/large/${dungeon.icon}.jpg`}
        alt={dungeon.name}
      />
      <div>{dungeon.name}</div>
      {children}
    </Button>
  )
}

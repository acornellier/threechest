import { Button, ButtonProps } from '../Common/Button.tsx'
import { Dungeon } from '../../data/types.ts'

interface Props extends ButtonProps {
  dungeon: Dungeon
  onClick: () => void
}

export function DungeonButton({ dungeon, onClick, className, children, ...props }: Props) {
  return (
    <Button
      key={dungeon.key}
      className={`flex gap-2 py-2 px-2 ${className}`}
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

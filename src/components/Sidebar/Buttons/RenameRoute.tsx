import { Dispatch, SetStateAction } from 'react'
import { Button } from '../../Common/Button.tsx'
import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline'

interface Props {
  isRenaming: boolean
  onClickRename: Dispatch<SetStateAction<boolean>>
  hidden?: boolean
}

export function RenameRoute({ isRenaming, onClickRename, hidden }: Props) {
  return (
    <Button
      Icon={isRenaming ? CheckIcon : PencilIcon}
      iconSize={20}
      onClick={() => onClickRename((v) => !v)}
      short
      className={`flex-1 ${hidden ? '[&]:hidden' : ''}`}
      tooltipId="rename-route-tooltip"
      tooltip="Rename route"
    />
  )
}

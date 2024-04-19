import type { Dispatch, SetStateAction} from 'react';
import { useLayoutEffect, useState } from 'react'

const noOp = () => {}

export function makeUseExclusiveState<T>(defaultValue: T | null = null) {
  let setLastUsedState: Dispatch<SetStateAction<T | null>> = noOp

  return () => {
    const [state, setState] = useState(defaultValue)

    useLayoutEffect(() => {
      if (state && setLastUsedState !== setState) {
        setLastUsedState(defaultValue)
        setLastUsedState = setState
      }

      return () => {
        if (setLastUsedState === setState) {
          setLastUsedState = noOp
        }
      }
    }, [state, setState])

    return [state, setState] as const
  }
}

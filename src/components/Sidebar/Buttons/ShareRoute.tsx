import { Button } from '../../Common/Button.tsx'
import { routeToMdtString } from '../../../util/mdtUtil.ts'
import { addToast } from '../../../store/reducers/toastReducer.ts'
import { ShareIcon } from '@heroicons/react/24/outline'
import { useCallback, useState } from 'react'
import { useRoute } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { shareRouteApi } from '../../../api/shareRouteApi.ts'
import { setShareId } from '../../../store/routes/routesReducer.ts'
import { copyText } from '../../../util/dev.ts'

interface Props {
  hidden?: boolean
}

export function ShareRoute({ hidden }: Props) {
  const dispatch = useAppDispatch()
  const route = useRoute()
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(async () => {
    try {
      setLoading(true)
      const str = await routeToMdtString(route)
      const shareId = await shareRouteApi(str, route.shareId)
      const isNewLink = shareId !== route.shareId
      if (isNewLink) {
        dispatch(setShareId({ routeId: route.uid, shareId }))
      }
      const url = window.location.origin + `?id=${encodeURIComponent(shareId)}`
      await copyText(url)
      dispatch(
        addToast({
          message: isNewLink
            ? 'Share link created and copied to clipboard!'
            : 'Existing share link updated and copied to clipboard!',
        }),
      )
    } catch (err) {
      dispatch(addToast({ message: `Failed to share route: ${err}`, type: 'error' }))
    }
    setLoading(false)
  }, [dispatch, route])

  return (
    <Button
      Icon={ShareIcon}
      short
      className={`flex-1 ${hidden ? '[&]:hidden' : ''}`}
      onClick={handleClick}
      disabled={loading}
    >
      {route.shareId ? 'Re-share' : 'Share'}
    </Button>
  )
}

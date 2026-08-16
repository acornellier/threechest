import { track } from '@vercel/analytics'
import { isProd } from './isDev.ts'

type EventProps = Record<string, string | number | boolean | null>

export type AnalyticsEvent =
  | 'collab_start'
  | 'collab_join'
  | 'sample_routes_open'
  | 'sample_route_import'

export function trackEvent(event: AnalyticsEvent, props?: EventProps) {
  if (!isProd) {
    console.debug('[analytics]', event, props ?? {})
    return
  }

  track(event, props)
}

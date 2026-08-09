import { useEffect, useMemo, useState } from 'react'
import type { DungeonKey } from '../../data/dungeonKeys.ts'
import type { SampleRoute } from '../types.ts'
import { easySampleRoutes } from '../../data/sampleRoutes/sampleRoutes.ts'
import { fetchRankedRoutes } from '../../api/rankingsApi.ts'
import { sortSampleRoutes } from '../wclRankings.ts'

/**
 * Merges the compiled-in "easy" routes with the WCL-ranked routes fetched from blob storage.
 * Fetches on mount so the dropdown is already populated by the time it's opened.
 */
export function useSampleRoutes(dungeonKey: DungeonKey) {
  const [rankedRoutes, setRankedRoutes] = useState<SampleRoute[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setRankedRoutes(null)
    setLoading(true)

    fetchRankedRoutes(dungeonKey)
      .then((routes) => {
        if (!cancelled) {
          setRankedRoutes(routes)
        }
      })
      .catch((e: unknown) => {
        // The easy routes still work, so degrade rather than blocking the dropdown.
        console.error('Failed to load ranked sample routes', e)
        if (!cancelled) {
          setRankedRoutes([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [dungeonKey])

  const sampleRoutes = useMemo(
    () => [...easySampleRoutes[dungeonKey], ...(rankedRoutes ?? [])].toSorted(sortSampleRoutes),
    [dungeonKey, rankedRoutes],
  )

  return { sampleRoutes, loading }
}

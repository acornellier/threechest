export interface ChangelogEntry {
  id: string
  title: string
  description: string
}

export interface ChangelogMonth {
  month: string
  entries: ChangelogEntry[]
}

/** Newest first. Ids are permanent - they are what "already seen" is stored against. */
export const changelog: ChangelogMonth[] = [
  {
    month: 'September 2026',
    entries: [
      {
        id: 'share-ids',
        title: 'Share links fixed',
        description:
          'Sharing a route you imported from somebody else used to overwrite their link. Every route now gets its own share link, and re-sharing updates that same link.',
      },
    ],
  },
  {
    month: 'August 2026',
    entries: [
      {
        id: 'compare-routes',
        title: 'Compare routes',
        description: 'Pick a second route to see the two pull lists diffed side by side.',
      },
      {
        id: 'kicks',
        title: 'Kick tracking',
        description:
          'Kicks needed are shown per pull and on mob icons. Hold K on the map to see them all at once.',
      },
      {
        id: 'mob-search',
        title: 'Mob search',
        description: 'Find any mob by name from the search button next to undo/redo.',
      },
    ],
  },
  {
    month: 'July 2026',
    entries: [
      {
        id: 'wcl-rewrite',
        title: 'Much better Warcraft Logs parsing',
        description:
          'Rewritten pull detection, and every sample route regenerated. Ranked routes now match what was actually pulled far more closely.',
      },
    ],
  },
  {
    month: 'May 2026',
    entries: [
      {
        id: 'cloud-sync',
        title: 'Cloud sync',
        description: 'Sign in with Google to sync your saved routes across devices.',
      },
    ],
  },
  {
    month: 'April 2026',
    entries: [
      {
        id: 'rankings-by-tank',
        title: 'Sample routes filtered by tank',
        description: 'Ranked routes are pulled for every tank spec, with varied comps per dungeon.',
      },
    ],
  },
]

const entryIds = changelog.flatMap(({ entries }) => entries.map(({ id }) => id))

export const latestChangelogId = entryIds[0]!

/** Ids newer than the last one the user saw. Empty if they have never opened the modal. */
export function unseenChangelogIds(lastSeenId: string | null): Set<string> {
  if (lastSeenId === null) return new Set()

  const lastSeenIndex = entryIds.indexOf(lastSeenId)
  if (lastSeenIndex === -1) return new Set()

  return new Set(entryIds.slice(0, lastSeenIndex))
}

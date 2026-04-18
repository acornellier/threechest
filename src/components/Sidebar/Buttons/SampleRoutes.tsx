import type { DropdownOption } from '../../Common/Dropdown.tsx'
import { Dropdown } from '../../Common/Dropdown.tsx'
import { useCallback, useMemo, useState } from 'react'
import type { Route } from '../../../util/types.ts'
import { sampleRoutes } from '../../../data/sampleRoutes/sampleRoutes.ts'
import { setPreviewRouteAsync } from '../../../store/reducers/importReducer.ts'
import { ArrowTopRightOnSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { setRouteFromSample } from '../../../store/routes/routesReducer.ts'
import { addToast } from '../../../store/reducers/toastReducer.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { classColors } from '../../../util/colors.ts'
import {
  pickSpecRankings,
  pickTopRankings,
  pickVariedComps,
  type Spec,
  tankSpecs,
  type WclRankingTeamMember,
} from '../../../util/wclRankings.ts'

interface SampleRouteOption extends DropdownOption {
  route: Route
}

const filterModes = ['varied', 'top', 'easy', 'spec'] as const
type FilterMode = (typeof filterModes)[number]

interface Props {
  hidden?: boolean
}

const roleToNum = (role: WclRankingTeamMember['role']) =>
  role === 'Tank' ? 0 : role === 'Healer' ? 1 : 2

function sortTeam(member1: WclRankingTeamMember, member2: WclRankingTeamMember) {
  if (member1.role !== member2.role) {
    return roleToNum(member1.role) - roleToNum(member2.role)
  }

  if (member1.class !== member2.role) {
    return member1.class.localeCompare(member2.class)
  }

  return member1.name.localeCompare(member2.name)
}

export function SampleRoutes({ hidden }: Props) {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const [mode, setMode] = useState<FilterMode>('varied')
  const [selectedSpec, setSelectedSpec] = useState<Spec>(tankSpecs[0]!)

  const options: SampleRouteOption[] = useMemo(() => {
    const routes = sampleRoutes[dungeon.key]

    function pickRankingsFromFilterMode() {
      const rankings = routes.filter((route) => route.wclRanking).map((route) => route.wclRanking!)

      if (mode === 'spec') {
        return pickSpecRankings(rankings, selectedSpec, 10)
      } else if (mode === 'top') {
        return pickTopRankings(rankings, 10)
      } else if (mode === 'varied') {
        return pickVariedComps(rankings, 10)
      }

      return []
    }

    const rankings = pickRankingsFromFilterMode()

    return routes
      .filter(
        (route) =>
          (mode === 'easy' && !route.wclRanking) ||
          (route.wclRanking && rankings.includes(route.wclRanking)),
      )
      .map<SampleRouteOption>(({ route, wclRanking }) => ({
        id: route.uid,
        route: route,
        content: (
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <div className="flex justify-between">
              <div className="flex items-center gap-1">
                {wclRanking && 'rank' in wclRanking && (
                  <div className="rounded-sm px-1 bg-cyan-800 text-xs">Rank {wclRanking.rank}</div>
                )}
                {route.name}
              </div>
              {wclRanking && (
                <div
                  className="justify-self-end"
                  onClick={() => {
                    window.open(
                      `https://www.warcraftlogs.com/reports/${wclRanking.report.code}?fight=${wclRanking.report.fightID}`,
                      '_blank',
                      'noopener',
                    )
                  }}
                >
                  <div className="rounded-sm bg-cyan-800 p-0.5">
                    <ArrowTopRightOnSquareIcon height={16} width={16} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-1 flex-wrap">
              {wclRanking &&
                wclRanking.team.toSorted(sortTeam).map((member, idx) => (
                  <div
                    key={member.id}
                    className="text-xs whitespace-nowrap"
                    style={{ color: classColors[member.class] }}
                  >
                    {member.name}
                    {idx === wclRanking.team.length}
                  </div>
                ))}
            </div>
          </div>
        ),
      }))
  }, [dungeon.key, mode, selectedSpec])

  const onSelect = useCallback(
    (option: SampleRouteOption) => {
      dispatch(setPreviewRouteAsync(null))
      dispatch(setRouteFromSample(option.route))
      dispatch(addToast({ message: `Imported ${option.route.name} as a copy` }))
    },
    [dispatch],
  )

  const onHover = useCallback(
    (option: SampleRouteOption | null) => {
      dispatch(setPreviewRouteAsync(option ? { routeId: option.id, route: option.route } : null))
    },
    [dispatch],
  )

  const handleModeChange = useCallback((mode: FilterMode) => {
    setMode(mode)
    setSelectedSpec((prev) => prev ?? tankSpecs[0]!)
  }, [])

  const filterHeader = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 justify-between">
        {filterModes.map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`text-sm px-1 py-0.5 rounded transition-colors ${
              mode === m
                ? 'bg-white/25 text-white'
                : 'text-gray-300 hover:bg-white/15 hover:text-white'
            }`}
          >
            {m === 'varied' ? 'Varied' : m === 'easy' ? 'Easy' : m === 'top' ? 'Top' : 'By Tank'}
          </button>
        ))}
      </div>
      {mode === 'spec' && (
        <div className="flex items-center gap-1 justify-between">
          {tankSpecs.map((spec) => (
            <button
              key={`${spec.class}-${spec.spec}`}
              onClick={() => setSelectedSpec(spec)}
              className={`rounded overflow-hidden border ${selectedSpec?.class === spec.class && selectedSpec?.spec === spec.spec ? 'border-white' : 'border-transparent'}`}
            >
              <img
                src={`https://wow.zamimg.com/images/wow/icons/large/${spec.icon}.jpg`}
                width={22}
                height={22}
                alt={`${spec.spec} ${spec.class}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Dropdown
      short
      options={options}
      onSelect={onSelect}
      onHover={onHover}
      header={filterHeader}
      buttonContent="Sample routes"
      MainButtonIcon={MagnifyingGlassIcon}
      className={`${hidden ? '[&]:hidden' : ''}`}
    />
  )
}

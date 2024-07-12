import type { DropdownOption } from '../../Common/Dropdown.tsx'
import { Dropdown } from '../../Common/Dropdown.tsx'
import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import type { Route } from '../../../util/types.ts'
import { sampleRoutes } from '../../../data/sampleRoutes/sampleRoutes.ts'
import { setPreviewRouteAsync } from '../../../store/reducers/importReducer.ts'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { setRouteFromSample } from '../../../store/routes/routesReducer.ts'
import { addToast } from '../../../store/reducers/toastReducer.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { classColors } from '../../../util/colors.ts'
import type { WclRankingTeamMember } from '../../../../server/wclRankings.ts'

interface SampleRouteOption extends DropdownOption {
  route: Route
}

function SampleRouteChip({ children }: { children: ReactNode }) {
  return <div className="rounded-sm px-1 bg-cyan-800 text-xs">{children}</div>
}

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

  const options: SampleRouteOption[] = useMemo(
    () =>
      sampleRoutes[dungeon.key].map(({ route, affix, difficulty, wclRanking }) => ({
        content: (
          <div className="flex flex-col gap-0.5">
            <div>{route.name}</div>
            <div className="flex gap-1">
              {difficulty && <SampleRouteChip>{difficulty}</SampleRouteChip>}
              {affix && <SampleRouteChip>{affix}</SampleRouteChip>}
              {wclRanking &&
                wclRanking.team.toSorted(sortTeam).map((member, idx) => (
                  <div
                    key={member.id}
                    className="text-xs whitespace-nowrap"
                    style={{
                      color: classColors[member.class],
                    }}
                  >
                    {member.name}
                    {idx === wclRanking.team.length}
                  </div>
                ))}
            </div>
          </div>
        ),
        id: route.uid,
        route: route,
      })),
    [dungeon.key],
  )

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

  return (
    <Dropdown
      short
      options={options}
      onSelect={onSelect}
      onHover={onHover}
      buttonContent="Sample routes"
      MainButtonIcon={MagnifyingGlassIcon}
      className={`${hidden ? '[&]:hidden' : ''}`}
    />
  )
}

import type { DropdownOption } from '../../Common/Dropdown.tsx'
import { Dropdown } from '../../Common/Dropdown.tsx'
import { useCallback, useMemo, useState } from 'react'
import type { Route } from '../../../util/types.ts'
import { sampleRoutes } from '../../../data/sampleRoutes/sampleRoutes.ts'
import { setPreviewRouteAsync } from '../../../store/reducers/importReducer.ts'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { setRouteFromSample } from '../../../store/routes/routesReducer.ts'
import { addToast } from '../../../store/reducers/toastReducer.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { classColors } from '../../../util/colors.ts'
import { pickVariedComps, type WclRankingTeamMember } from '../../../util/wclRankings.ts'

type More = 'TOP'
type Default = 'DEFAULT'
interface SampleRouteOption extends DropdownOption {
  route: Route | More | Default
}

const showMoreOption: SampleRouteOption = { id: 'MORE', route: 'TOP', content: 'Show top 10' }
const showLessOption: SampleRouteOption = { id: 'LESS', route: 'DEFAULT', content: 'Show default' }

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
  const [showTop, setShowTop] = useState(false)

  const options: SampleRouteOption[] = useMemo(() => {
    const routes = sampleRoutes[dungeon.key]
    const rankings = routes.filter((route) => route.wclRanking).map((route) => route.wclRanking!)
    const topRankings = showTop ? rankings.slice(0, 10) : pickVariedComps(rankings, 5)
    const options = routes
      .filter(
        (route) =>
          (!showTop && !route.wclRanking) ||
          (route.wclRanking && topRankings.includes(route.wclRanking)),
      )
      .map<SampleRouteOption>(({ route, wclRanking }) => ({
        id: route.uid,
        route: route,
        content: (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              {wclRanking && (
                <div className="rounded-sm px-1 bg-cyan-800 text-xs">Rank {wclRanking.rank}</div>
              )}
              {route.name}
            </div>
            <div className="flex gap-1 flex-wrap">
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
      }))
    options.push(showTop ? showLessOption : showMoreOption)
    return options
  }, [dungeon.key, showTop])

  const onSelect = useCallback(
    (option: SampleRouteOption) => {
      if (option.route === 'TOP' || option.route === 'DEFAULT') {
        setShowTop(option.route === 'TOP')
        return false
      }

      dispatch(setPreviewRouteAsync(null))
      dispatch(setRouteFromSample(option.route))
      dispatch(addToast({ message: `Imported ${option.route.name} as a copy` }))
    },
    [dispatch],
  )

  const onHover = useCallback(
    (option: SampleRouteOption | null) => {
      if (option?.route === 'TOP' || option?.route === 'DEFAULT') return
      console.log(option?.id)
      dispatch(setPreviewRouteAsync(option ? { routeId: option.id, route: option.route } : null))
    },
    [dispatch],
  )

  const onClose = useCallback(() => setShowTop(false), [])

  return (
    <Dropdown
      short
      options={options}
      onSelect={onSelect}
      onHover={onHover}
      onClose={onClose}
      buttonContent="Sample routes"
      MainButtonIcon={MagnifyingGlassIcon}
      className={`${hidden ? '[&]:hidden' : ''}`}
    />
  )
}

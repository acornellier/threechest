import type { Spawn } from '../../../data/types.ts'
import { Marker } from 'react-leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { scaledDivIcon } from '../../../util/scaledIcon.ts'
import { getIconLink } from '../../../data/spells/spells.ts'
import { ccSpells } from '../../../data/spells/ccSpells.ts'

interface Props {
  spawn: Spawn
  scale: number
  boxScale: number
  spellId: number
}

export function CcMarker({ spawn, scale, boxScale, spellId }: Props) {
  const ccSpell = ccSpells[spellId]
  if (!ccSpell) return null

  return (
    <Marker
      position={spawn.pos}
      interactive={false}
      zIndexOffset={1200}
      icon={scaledDivIcon(
        {
          className: `cc-marker fade-in-map-object`,
          html: renderToStaticMarkup(
            <div
              className="absolute rounded-full overflow-hidden border-transparent"
              style={{
                width: '60%',
                height: '60%',
                top: '20%',
                left: '20%',
                background: 'linear-gradient(to bottom, #dfdfe3, #373738) border-box',
                borderWidth: 'calc(var(--icon-size) * 0.02)',
                boxShadow: 'black 0px 0px 6px 2px',
              }}
            >
              <div
                className="absolute h-full w-full"
                style={{
                  backgroundImage: `url(${getIconLink(ccSpell.icon)})`,
                  backgroundSize: 'contain',
                }}
              />
            </div>,
          ),
        },
        { scale, boxScale },
      )}
    />
  )
}

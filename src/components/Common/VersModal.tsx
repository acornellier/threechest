import { Button } from './Button'

interface Props {
  open: boolean
  hide: () => void
}

export function VersModal({ open, hide }: Props) {
  if (!open) return null

  return (
    <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-full">
      <div className="fixed w-full h-full opacity-80 bg-neutral-800" />
      <div className="relative w-full max-w-xl max-h-full p-5 flex flex-col gap-5 rounded-lg shadow bg-white dark:bg-zinc-700 border-2 border-gray-600">
        <h3 className="text-xl font-semibold">
          IMPORTANT: Versatility and avoidance input change
        </h3>

        <div className="leading-relaxed">
          <p>You must now input RAW versatility and avoidance instead of %.</p>
          <p>
            Do <i>not</i> include vers phial.
          </p>
          <p>Your previously saved versatility and avoidance values have been cleared.</p>
          <p>Phial of Tepid Versatility can now be toggled in the externals row!</p>
        </div>

        <div className="flex justify-center items-center">
          <Button onClick={hide} className="w-32 text-lg justify-center">
            Got it!
          </Button>
        </div>
      </div>
    </div>
  )
}

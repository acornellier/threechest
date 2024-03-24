interface Props {
  input: string
  setInput: (value: string) => void
  onClose: () => void
}

export function RenameRouteInput({ setInput, input, onClose }: Props) {
  return (
    <input
      className="fancy w-full rounded-md"
      autoFocus
      placeholder="Route name"
      onKeyDown={(e) => e.key === 'Enter' && onClose()}
      onChange={(e) => setInput(e.target.value)}
      value={input}
    />
  )
}

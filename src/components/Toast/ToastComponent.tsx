import { Toast } from './ToastProvider.tsx'

function Checkmark() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 -ml-1"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  )
}

interface Props {
  toast: Toast
}

export function ToastComponent({ toast }: Props) {
  return (
    <div
      className={`fancy-toast gritty flex items-center gap-2 
                  transition-opacity duration-500 ${toast.removing ? 'opacity-0' : ''}`}
    >
      <Checkmark />
      <div>{toast.message}</div>
    </div>
  )
}

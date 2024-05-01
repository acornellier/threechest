import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, defaultValue: T, json: boolean = true) {
  const [value, setValue] = useState<T>(() => {
    let currentValue

    try {
      const storedValue = localStorage.getItem(key)
      currentValue = json
        ? (JSON.parse(storedValue ?? String(defaultValue)) as T)
        : (storedValue as T) ?? defaultValue
    } catch (error) {
      currentValue = defaultValue
    }

    return currentValue
  })

  useEffect(() => {
    localStorage.setItem(key, json ? JSON.stringify(value) : (value as string))
  }, [value, key, json])

  return [value, setValue] as const
}

import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, defaultValue: T, json: boolean) {
  const [value, setValue] = useState(() => {
    let currentValue

    try {
      const storedValue = localStorage.getItem(key)
      currentValue = json
        ? JSON.parse(storedValue ?? String(defaultValue))
        : storedValue ?? defaultValue
    } catch (error) {
      currentValue = defaultValue
    }

    return currentValue
  })

  useEffect(() => {
    localStorage.setItem(key, json ? JSON.stringify(value) : value)
  }, [value, key, json])

  return [value, setValue]
}

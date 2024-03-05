const importUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/importRoute'
    : '/api/importRoute'

export const importRoute = (str: string) =>
  fetch(importUrl, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ str }),
  }).then((res) => res.json())

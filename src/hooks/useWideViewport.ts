import { useEffect, useState } from 'react'

// Matches the 3/4-column breakpoint in App.css.
const WIDE_QUERY = '(min-width: 1120px)'

function matches(): boolean {
  // Environments without matchMedia (e.g. jsdom) are treated as wide.
  return typeof window.matchMedia !== 'function' || window.matchMedia(WIDE_QUERY).matches
}

export function useWideViewport(): boolean {
  const [wide, setWide] = useState(matches)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(WIDE_QUERY)
    const onChange = () => setWide(query.matches)
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return wide
}

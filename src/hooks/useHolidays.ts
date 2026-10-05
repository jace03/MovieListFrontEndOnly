import { useEffect, useState } from 'react'
import { api } from '../lib/apiClient'
import type { HolidayInfo } from '../types'

export function useHolidays() {
  const [holidays, setHolidays] = useState<HolidayInfo[]>([])

  useEffect(() => {
    let cancelled = false
    api.get<HolidayInfo[]>('/holidays').then(({ data }) => {
      if (!cancelled && data) setHolidays(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { holidays }
}

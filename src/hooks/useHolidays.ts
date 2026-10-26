import { useEffect, useState } from 'react'
import { db } from '../lib/db'
import type { HolidayInfo, SlotCountKey } from '../types'

export function useHolidays() {
  const [holidays, setHolidays] = useState<HolidayInfo[]>([])

  useEffect(() => {
    let cancelled = false
    db.fetchHolidays().then(({ data }) => {
      if (!cancelled && data) setHolidays(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function updateSlotCounts(id: number, counts: Record<SlotCountKey, number>) {
    const { data, error } = await db.updateHoliday(id, counts)
    if (error || !data) return error?.message ?? 'Could not save settings'
    setHolidays((prev) => prev.map((h) => (h.id === id ? data : h)))
    return null
  }

  return { holidays, updateSlotCounts }
}

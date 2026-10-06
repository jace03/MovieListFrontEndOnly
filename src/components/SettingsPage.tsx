import { useState } from 'react'
import { SLOT_COUNT_FIELDS, type HolidayInfo, type SlotCountKey } from '../types'

interface SettingsPageProps {
  holidays: HolidayInfo[]
  onSave: (holidayId: number, counts: Record<SlotCountKey, number>) => Promise<string | null>
}

function HolidaySettings({ holiday, onSave }: { holiday: HolidayInfo; onSave: SettingsPageProps['onSave'] }) {
  const [values, setValues] = useState<Record<SlotCountKey, string>>(() => ({
    day_of_count: String(holiday.day_of_count),
    week_of_count: String(holiday.week_of_count),
    two_weeks_away_count: String(holiday.two_weeks_away_count),
    three_weeks_away_count: String(holiday.three_weeks_away_count),
  }))
  const [status, setStatus] = useState<'idle' | 'saved' | string>('idle')

  const parsed = SLOT_COUNT_FIELDS.map(({ key }) => Number(values[key]))
  const valid = SLOT_COUNT_FIELDS.every(
    ({ key }) => values[key].trim() !== '' && Number.isInteger(Number(values[key])) && Number(values[key]) >= 0 && Number(values[key]) <= 100,
  )

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!valid) return
    const counts = Object.fromEntries(SLOT_COUNT_FIELDS.map(({ key }, i) => [key, parsed[i]])) as Record<
      SlotCountKey,
      number
    >
    const error = await onSave(holiday.id, counts)
    setStatus(error ?? 'saved')
  }

  return (
    <form className="movie-form settings-card" onSubmit={handleSubmit}>
      <h3>
        {holiday.emoji} {holiday.name}
      </h3>
      <div className="settings-fields">
        {SLOT_COUNT_FIELDS.map(({ key, label }) => (
          <label key={key} className="settings-field">
            <span>{label}</span>
            <input
              type="number"
              min={0}
              max={100}
              value={values[key]}
              onChange={(e) => {
                setValues({ ...values, [key]: e.target.value })
                setStatus('idle')
              }}
            />
          </label>
        ))}
        <div className="settings-field">
          <span>A month away</span>
          <span className="settings-rest">Everything left over</span>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={!valid}>
          Save
        </button>
        {status === 'saved' && <span className="settings-status">Saved</span>}
        {status !== 'idle' && status !== 'saved' && <span className="settings-status error">{status}</span>}
      </div>
    </form>
  )
}

export function SettingsPage({ holidays, onSave }: SettingsPageProps) {
  return (
    <section className="settings-section">
      <h2>Auto calculate settings</h2>
      <p className="settings-help">
        How many of each holiday's top-ranked movies Auto calculate puts in each calendar slot.
      </p>
      {holidays.map((holiday) => (
        <HolidaySettings key={holiday.id} holiday={holiday} onSave={onSave} />
      ))}
    </section>
  )
}

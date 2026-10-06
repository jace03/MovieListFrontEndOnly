import { useState } from 'react'
import { ConfirmDialog } from './ConfirmDialog'
import { WATCH_WINDOWS, type HolidayInfo, type Movie, type WatchWindow } from '../types'

const MAX_PEEKING_CARDS = 3

function Poster({ movie, emoji }: { movie: Movie; emoji: string }) {
  return movie.posterUrl ? (
    <img className="calendar-poster" src={movie.posterUrl} alt={`${movie.title} poster`} loading="lazy" />
  ) : (
    <span className="calendar-poster calendar-poster-placeholder" aria-hidden="true">
      {emoji}
    </span>
  )
}

interface CalendarPlannerProps {
  movies: Movie[]
  holidays: HolidayInfo[]
  onToggleWatched: (id: string) => void
  onMoveToWindow: (id: string, watchWindow: WatchWindow) => void
  onAutoCalculate: (holidayId: number) => void
  onClear: (holidayId: number) => void
}

export function CalendarPlanner({ movies, holidays, onToggleWatched, onMoveToWindow, onAutoCalculate, onClear }: CalendarPlannerProps) {
  const [holidayName, setHolidayName] = useState<string | null>(null)
  const [openWindows, setOpenWindows] = useState<Set<WatchWindow>>(new Set())
  const [confirming, setConfirming] = useState(false)

  const activeHoliday = holidays.find((h) => h.name === holidayName) ?? holidays[0]
  if (!activeHoliday) return <p className="empty-state">Loading...</p>

  const holidayMovies = movies.filter((m) => m.holiday === activeHoliday.name)
  // Anything planned outside 'month away' means the calendar has been filled in.
  const hasPlan = holidayMovies.some((m) => m.watchWindow !== 'month_away')

  function toggleWindow(value: WatchWindow) {
    setOpenWindows((prev) => {
      const next = new Set(prev)
      if (!next.delete(value)) next.add(value)
      return next
    })
  }

  return (
    <section className="calendar-section">
      <div className="rank-toolbar">
        <div className="filters" role="tablist" aria-label="Holiday calendar">
          {holidays.map((h) => (
            <button
              key={h.id}
              type="button"
              role="tab"
              aria-selected={h.name === activeHoliday.name}
              className={`filter-btn ${h.name === activeHoliday.name ? 'active' : ''}`}
              onClick={() => setHolidayName(h.name)}
            >
              {h.name}
            </button>
          ))}
        </div>
        <button type="button" className="btn-primary" onClick={() => setConfirming(true)}>
          {hasPlan ? 'Clear' : 'Auto calculate'}
        </button>
      </div>

      <div className="calendar-pillar">
        {WATCH_WINDOWS.map(({ value, label }) => {
          const inWindow = holidayMovies.filter((m) => m.watchWindow === value).sort((a, b) => a.rank - b.rank)
          const open = openWindows.has(value)
          const panelId = `calendar-panel-${value}`

          return (
            <div key={value} className={`calendar-row ${open ? 'open' : ''}`}>
              <div className="calendar-square-wrap">
                {/* Cards tucked behind the square; they slide out a little on hover. */}
                {!open &&
                  inWindow.slice(0, MAX_PEEKING_CARDS).map((movie, index) => (
                    <span
                      key={movie.id}
                      className="calendar-peek"
                      style={{ '--peek-index': index + 1 } as React.CSSProperties}
                      aria-hidden="true"
                    >
                      <Poster movie={movie} emoji={activeHoliday.emoji} />
                    </span>
                  ))}
                <button
                  type="button"
                  className="calendar-square"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggleWindow(value)}
                >
                  <span className="calendar-square-label">{label}</span>
                  <span className="calendar-square-count">
                    {inWindow.filter((m) => m.watched).length}/{inWindow.length} watched
                  </span>
                </button>
              </div>

              <div className="calendar-fold" id={panelId} hidden={!open}>
                <ul className="calendar-cards">
                  {inWindow.length === 0 && <li className="calendar-empty">Nothing planned</li>}
                  {inWindow.map((movie) => (
                    <li key={movie.id} className={`calendar-card ${movie.watched ? 'watched' : ''}`}>
                      <label className="calendar-watched" title="Watched">
                        <input
                          type="checkbox"
                          checked={movie.watched}
                          aria-label={`${movie.title} watched`}
                          onChange={() => onToggleWatched(movie.id)}
                        />
                      </label>
                      <Poster movie={movie} emoji={activeHoliday.emoji} />
                      <div className="calendar-card-body">
                        <span className="calendar-card-title" title={movie.title}>
                          {movie.title}
                        </span>
                        <select
                          className="calendar-move"
                          aria-label={`Move ${movie.title} to another slot`}
                          value={movie.watchWindow}
                          onChange={(event) => onMoveToWindow(movie.id, event.target.value as WatchWindow)}
                        >
                          {WATCH_WINDOWS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
      {confirming && (
        <ConfirmDialog
          title={hasPlan ? 'Clear the calendar?' : 'Auto calculate the calendar?'}
          message={
            hasPlan ? (
              <>
                This wipes the calendar slots for every <strong>{activeHoliday.name}</strong> movie and puts them back
                in A month away. No movies are deleted.
              </>
            ) : (
              <>
                This plans every <strong>{activeHoliday.name}</strong> movie from its ranking. Change how many go in
                each slot in Settings.
              </>
            )
          }
          confirmLabel={hasPlan ? 'Clear' : 'Auto calculate'}
          onConfirm={() => {
            if (hasPlan) onClear(activeHoliday.id)
            else onAutoCalculate(activeHoliday.id)
            setConfirming(false)
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </section>
  )
}

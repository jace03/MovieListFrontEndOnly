import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { UNRANKED, type HolidayInfo, type Movie } from '../types'
import { ConfirmDialog } from './ConfirmDialog'
import { RankBadge } from './RankBadge'

type Mode = 'grid' | 'game'

interface RankMoviesProps {
  movies: Movie[]
  holidays: HolidayInfo[]
  onReorder: (orderedIds: string[], movedIds?: string | string[]) => void
  onSetRank: (id: string, rank: number) => void
}

function Poster({ movie, emoji }: { movie: Movie; emoji: string }) {
  return movie.posterUrl ? (
    <img className="rank-poster" src={movie.posterUrl} alt={`${movie.title} poster`} loading="lazy" />
  ) : (
    <div className="rank-poster rank-poster-placeholder" aria-hidden="true">
      {emoji}
    </div>
  )
}

export function RankMovies({ movies, holidays, onReorder, onSetRank }: RankMoviesProps) {
  const [holidayName, setHolidayName] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('grid')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  // Index of the upper movie of the pair being compared in game mode.
  const [pairIndex, setPairIndex] = useState<number | null>(null)
  const [bottomCandidate, setBottomCandidate] = useState<Movie | null>(null)

  const activeHoliday = holidays.find((h) => h.name === holidayName) ?? holidays[0]
  const emoji = activeHoliday?.emoji ?? '🎬'

  // Ranked movies first (rank 1 on top), unranked at the end.
  const list = useMemo(
    () => movies.filter((m) => m.holiday === activeHoliday?.name).sort((a, b) => a.rank - b.rank),
    [movies, activeHoliday],
  )

  // While dragging, the grid previews the result: the dragged card sits in the cell under the cursor.
  const displayList = useMemo(() => {
    if (!draggedId || targetIndex === null) return list
    const from = list.findIndex((m) => m.id === draggedId)
    if (from === -1) return list
    const preview = [...list]
    const [moved] = preview.splice(from, 1)
    preview.splice(Math.min(targetIndex, preview.length), 0, moved)
    return preview
  }, [list, draggedId, targetIndex])

  // Slides cards from their old spot to their new one whenever the order changes (FLIP). Positions
  // come from the layout (offsetLeft/Top), not getBoundingClientRect, so a card that is still
  // mid-slide doesn't throw the measurement off and fly in from nowhere.
  const gridRef = useRef<HTMLUListElement>(null)
  const cardRefs = useRef(new Map<string, HTMLLIElement>())
  const lastPositions = useRef(new Map<string, { left: number; top: number }>())
  const orderKey = displayList.map((m) => m.id).join(',')
  useLayoutEffect(() => {
    const next = new Map<string, { left: number; top: number }>()
    cardRefs.current.forEach((el, id) => {
      const position = { left: el.offsetLeft, top: el.offsetTop }
      next.set(id, position)
      const before = lastPositions.current.get(id)
      if (!before || (before.left === position.left && before.top === position.top)) return
      if (typeof el.animate !== 'function') return
      // Start from where the card visibly is right now, so interrupting a slide stays smooth.
      const current = getComputedStyle(el).transform
      const matrix = current && current !== 'none' ? new DOMMatrix(current) : null
      const fromX = before.left - position.left + (matrix?.m41 ?? 0)
      const fromY = before.top - position.top + (matrix?.m42 ?? 0)
      el.getAnimations().forEach((animation) => animation.cancel())
      el.animate(
        [{ transform: `translate(${fromX}px, ${fromY}px)` }, { transform: 'translate(0, 0)' }],
        { duration: 300, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
      )
    })
    lastPositions.current = next
  }, [orderKey])

  // Which grid cell is under the cursor, judged from the layout so sliding cards can't confuse it.
  function handleGridDragOver(event: React.DragEvent<HTMLUListElement>) {
    event.preventDefault()
    const grid = gridRef.current
    if (!grid || !draggedId) return
    const origin = grid.getBoundingClientRect()
    const x = event.clientX - origin.left
    const y = event.clientY - origin.top
    const cells = Array.from(grid.children) as HTMLElement[]
    const index = cells.findIndex((cell) => {
      const left = cell.offsetLeft - grid.offsetLeft
      const top = cell.offsetTop - grid.offsetTop
      return x >= left && x < left + cell.offsetWidth && y >= top && y < top + cell.offsetHeight
    })
    if (index !== -1) setTargetIndex(index)
  }

  // Random pair of neighbours, different from the previous one when there's a choice.
  function pickPair(previous: number | null) {
    if (list.length < 2) return null
    const choices = list.length - 1
    if (choices === 1) return 0
    let next = Math.floor(Math.random() * choices)
    if (next === previous) next = (next + 1 + Math.floor(Math.random() * (choices - 1))) % choices
    return next
  }

  // Keeps the pair valid when the list changes underneath it (switching holiday, deleting, ...).
  const currentPair = pairIndex !== null && pairIndex < list.length - 1 ? pairIndex : pickPair(null)

  function selectHoliday(name: string) {
    setHolidayName(name)
    setPairIndex(null)
  }

  // The grid already shows the previewed order, so dropping anywhere on it just keeps that order.
  function handleDrop() {
    if (draggedId && targetIndex !== null) {
      onReorder(displayList.map((m) => m.id), draggedId)
    }
    setDraggedId(null)
    setTargetIndex(null)
  }

  function choose(winnerIndex: 0 | 1) {
    if (currentPair === null) return
    const upper = list[currentPair]
    const lower = list[currentPair + 1]
    const winner = winnerIndex === 0 ? upper : lower
    const loser = winnerIndex === 0 ? lower : upper
    // The winner ends up directly above the loser; every other movie keeps its place.
    const ids = list.map((m) => m.id)
    ids[currentPair] = winner.id
    ids[currentPair + 1] = loser.id
    onReorder(ids, [winner.id, loser.id])
    setPairIndex(pickPair(currentPair))
  }

  if (holidays.length === 0) return <p className="empty-state">Loading...</p>

  return (
    <section className="rank-section">
      <div className="rank-toolbar">
        <div className="filters" role="tablist" aria-label="Holiday to rank">
          {holidays.map((h) => (
            <button
              key={h.id}
              type="button"
              role="tab"
              aria-selected={h.name === activeHoliday.name}
              className={`filter-btn ${h.name === activeHoliday.name ? 'active' : ''}`}
              onClick={() => selectHoliday(h.name)}
            >
              {h.name}
            </button>
          ))}
        </div>
        <div className="filters" role="group" aria-label="Ranking mode">
          {(['grid', 'game'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              className={`filter-btn ${mode === m ? 'active' : ''}`}
              onClick={() => setMode(m)}
            >
              {m === 'grid' ? 'Grid' : 'Game'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'grid' &&
        (list.length === 0 ? (
          <p className="empty-state">No {activeHoliday.name} movies yet.</p>
        ) : (
          <ul
            ref={gridRef}
            className="rank-grid"
            onDragOver={handleGridDragOver}
            onDrop={(event) => {
              event.preventDefault()
              handleDrop()
            }}
          >
            {displayList.map((movie) => (
              <li
                key={movie.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(movie.id, el)
                  else cardRefs.current.delete(movie.id)
                }}
                className={draggedId === movie.id ? 'rank-card dragging' : 'rank-card'}
                draggable
                onDragStart={() => setDraggedId(movie.id)}
                onDragEnd={() => {
                  setDraggedId(null)
                  setTargetIndex(null)
                }}
              >
                <Poster movie={movie} emoji={emoji} />
                <div className="rank-card-footer">
                  <RankBadge
                    rank={movie.rank}
                    isRankTaken={(rank) =>
                      list.some((m) => m.id !== movie.id && m.rank === rank && rank < UNRANKED)
                    }
                    onRankChange={(rank) => onSetRank(movie.id, rank)}
                  />
                  <span className="rank-title" title={movie.title}>
                    {movie.title}
                  </span>
                  <button
                    type="button"
                    className="rank-to-bottom"
                    aria-label={`Move ${movie.title} to the bottom`}
                    title="Move to bottom"
                    onClick={() => setBottomCandidate(movie)}
                  >
                    ⤓
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ))}

      {mode === 'game' &&
        (currentPair === null ? (
          <p className="empty-state">Add at least two {activeHoliday.name} movies to play.</p>
        ) : (
          <div className="rank-game">
            <p className="rank-game-prompt">Which one is better?</p>
            <div className="rank-game-pair">
              {[list[currentPair], list[currentPair + 1]].map((movie, index) => (
                <button
                  key={movie.id}
                  type="button"
                  className="rank-game-card"
                  onClick={() => choose(index as 0 | 1)}
                >
                  <Poster movie={movie} emoji={emoji} />
                  <span className="rank-title">
                    {movie.title}
                    {movie.year !== '' && <span className="year"> ({movie.year})</span>}
                  </span>
                  <span className="rank-game-current">
                    {movie.rank >= UNRANKED ? 'Unranked' : `Currently #${movie.rank}`}
                  </span>
                </button>
              ))}
            </div>
            <button type="button" className="btn-link" onClick={() => setPairIndex(pickPair(currentPair))}>
              Skip this pair
            </button>
          </div>
        ))}
      {bottomCandidate && (
        <ConfirmDialog
          title="Move to the bottom?"
          message={
            <>
              <strong>{bottomCandidate.title}</strong> will drop to last place in your {activeHoliday.name}{' '}
              ranking.
            </>
          }
          confirmLabel="Move to bottom"
          onConfirm={() => {
            // Anything past the last spot is clamped to last place.
            onSetRank(bottomCandidate.id, UNRANKED - 1)
            setBottomCandidate(null)
          }}
          onCancel={() => setBottomCandidate(null)}
        />
      )}
    </section>
  )
}

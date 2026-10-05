import { useEffect, useState } from 'react'
import { searchMovieSuggestions, type MovieSuggestion } from '../lib/tmdb'
import { UNRANKED, type Holiday, type HolidayInfo, type Movie, type MovieDraft } from '../types'

const GENRE_SUGGESTIONS = ['Comedy', 'Horror', 'Fantasy', 'Thriller', 'Mystery', 'Rom-Com', 'Animation']
const DECADE_SUGGESTIONS = ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s']

function makeEmptyDraft(holiday: Holiday): MovieDraft {
  return {
    title: '',
    year: '',
    addedBy: 'Both',
    rating: 5,
    genre: '',
    decade: '',
    holiday,
    rank: UNRANKED,
    watched: false,
    notes: '',
    posterUrl: '',
  }
}

interface MovieFormProps {
  editingMovie: Movie | null
  prefill?: MovieSuggestion | null
  defaultHoliday: Holiday
  holidays?: HolidayInfo[]
  onSave: (draft: MovieDraft, id: string | null) => void
  onCancel: () => void
}

export function MovieForm({
  editingMovie,
  prefill = null,
  defaultHoliday,
  holidays = [],
  onSave,
  onCancel,
}: MovieFormProps) {
  const [draft, setDraft] = useState<MovieDraft>(() => makeEmptyDraft(defaultHoliday))

  // Keep the current value selectable even if the holiday list hasn't loaded yet.
  const holidayOptions = Array.from(
    new Set([...holidays.map((h) => h.name), defaultHoliday, draft.holiday].filter(Boolean)),
  )

  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (editingMovie) {
      setDraft({ ...editingMovie, posterUrl: editingMovie.posterUrl ?? '' })
    } else if (prefill) {
      setDraft({
        ...makeEmptyDraft(defaultHoliday),
        title: prefill.title,
        year: prefill.year,
        genre: prefill.genre,
        decade: prefill.decade,
        posterUrl: prefill.posterUrl ?? '',
      })
    } else {
      setDraft(makeEmptyDraft(defaultHoliday))
    }
    setSuggestions([])
    setShowSuggestions(false)
  }, [editingMovie, prefill, defaultHoliday])

  // Only search while the user is actively typing a title (not after picking a suggestion).
  useEffect(() => {
    if (!showSuggestions) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      const results = await searchMovieSuggestions(draft.title, controller.signal)
      if (!controller.signal.aborted) setSuggestions(results)
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [draft.title, showSuggestions])

  function applySuggestion(s: MovieSuggestion) {
    setDraft((d) => ({
      ...d,
      title: s.title,
      year: s.year,
      genre: s.genre || d.genre,
      decade: s.decade || d.decade,
      posterUrl: s.posterUrl ?? d.posterUrl,
    }))
    setSuggestions([])
    setShowSuggestions(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.title.trim()) return
    onSave(draft, editingMovie?.id ?? null)
    if (!editingMovie) setDraft(makeEmptyDraft(defaultHoliday))
  }

  return (
    <form className="movie-form" onSubmit={handleSubmit}>
      <h2>{editingMovie ? 'Edit movie' : 'Add a movie'}</h2>

      <div className="form-row">
        <label htmlFor="title">Title</label>
        <div className="title-suggest">
          <input
            id="title"
            type="text"
            value={draft.title}
            onChange={(e) => {
              setDraft({ ...draft, title: e.target.value })
              setShowSuggestions(true)
            }}
            onBlur={() => setShowSuggestions(false)}
            placeholder="e.g. Hocus Pocus"
            autoComplete="off"
            required
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions" role="listbox" aria-label="Movie suggestions">
              {suggestions.map((s) => (
                <li key={s.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applySuggestion(s)}
                  >
                    {s.posterUrl ? (
                      <img src={s.posterUrl} alt="" width={30} height={45} />
                    ) : (
                      <span className="suggestion-noposter" />
                    )}
                    <span>
                      {s.title}
                      {s.year !== '' && <span className="suggestion-year"> ({s.year})</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="form-row form-row-inline">
        <div>
          <label htmlFor="year">Year</label>
          <input
            id="year"
            type="number"
            value={draft.year}
            onChange={(e) =>
              setDraft({
                ...draft,
                year: e.target.value === '' ? '' : Number(e.target.value),
              })
            }
            placeholder="1993"
          />
        </div>

        <div>
          <label htmlFor="addedBy">Picked by</label>
          <select
            id="addedBy"
            value={draft.addedBy}
            onChange={(e) =>
              setDraft({ ...draft, addedBy: e.target.value as Movie['addedBy'] })
            }
          >
            <option value="Both">Both</option>
            <option value="His">His</option>
            <option value="Hers">Hers</option>
          </select>
        </div>

        <div>
          <label htmlFor="holiday">Holiday</label>
          <select
            id="holiday"
            value={draft.holiday}
            onChange={(e) => setDraft({ ...draft, holiday: e.target.value as Holiday, rank: UNRANKED })}
          >
            {holidayOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="rating">Rating ({draft.rating > 0 ? `${draft.rating}/10` : 'unrated'})</label>
          <input
            id="rating"
            type="range"
            min={0}
            max={10}
            value={draft.rating}
            onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="form-row form-row-inline">
        <div>
          <label htmlFor="genre">Genre</label>
          <input
            id="genre"
            type="text"
            list="genre-suggestions"
            value={draft.genre}
            onChange={(e) => setDraft({ ...draft, genre: e.target.value })}
            placeholder="e.g. Horror"
          />
          <datalist id="genre-suggestions">
            {GENRE_SUGGESTIONS.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="decade">Decade</label>
          <input
            id="decade"
            type="text"
            list="decade-suggestions"
            value={draft.decade}
            onChange={(e) => setDraft({ ...draft, decade: e.target.value })}
            placeholder="e.g. 1990s"
          />
          <datalist id="decade-suggestions">
            {DECADE_SUGGESTIONS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>

      </div>

      <div className="form-row">
        <label htmlFor="posterUrl">Poster image URL</label>
        <input
          id="posterUrl"
          type="url"
          value={draft.posterUrl ?? ''}
          onChange={(e) => setDraft({ ...draft, posterUrl: e.target.value })}
          placeholder="Optional — leave blank to look one up automatically"
        />
      </div>

      <div className="form-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={draft.watched}
            onChange={(e) => setDraft({ ...draft, watched: e.target.checked })}
          />
          Watched
        </label>
      </div>

      <div className="form-row">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          placeholder="Optional notes..."
          rows={2}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {editingMovie ? 'Save changes' : 'Add movie'}
        </button>
        {editingMovie && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

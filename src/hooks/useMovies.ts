import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/apiClient'
import { fetchPosterUrl } from '../lib/tmdb'
import { UNRANKED, type Movie, type MovieDraft, type MovieRow, type WatchWindow } from '../types'

function byRank(a: Movie, b: Movie) {
  return a.rank - b.rank
}

function normalizeRow(row: MovieRow): MovieRow {
  return { ...row, id: String(row.id) }
}

function rowToMovie(row: MovieRow): Movie {
  return {
    id: row.id,
    title: row.title,
    year: row.year ?? '',
    addedBy: row.added_by,
    rating: row.rating,
    genre: row.genre ?? '',
    decade: row.decade ?? '',
    holiday: row.holiday,
    rank: row.rank,
    watchWindow: row.watch_window ?? 'month_away',
    watched: row.watched,
    notes: row.notes,
    posterUrl: row.poster_url,
    cast: (row.movie_actor ?? [])
      .map((link) => link.actors?.name)
      .filter((name): name is string => !!name)
      .sort(),
  }
}

function draftToRow(draft: MovieDraft) {
  return {
    title: draft.title,
    year: draft.year === '' ? null : draft.year,
    added_by: draft.addedBy,
    rating: draft.rating,
    genre: draft.genre.trim() === '' ? null : draft.genre.trim(),
    decade: draft.decade.trim() === '' ? null : draft.decade.trim(),
    holiday: draft.holiday,
    rank: draft.rank,
    watch_window: draft.watchWindow,
    watched: draft.watched,
    notes: draft.notes,
  }
}

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchError } = await api.get<MovieRow[]>('/movies')

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setError(null)
      setMovies((data ?? []).map(normalizeRow).map(rowToMovie).sort(byRank))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  function rankedInOrder(list: Movie[], holiday: Movie['holiday'], excludeId?: string) {
    return list
      .filter((m) => m.holiday === holiday && m.rank < UNRANKED && m.id !== excludeId)
      .sort((a, b) => a.rank - b.rank)
  }

  // Applies new ranks to `base`, keeps the list sorted by rank, and saves only the movies whose
  // rank actually changed. On failure it restores `revertTo`, or reloads from the server.
  async function persistRanks(base: Movie[], rankById: Map<string, number>, revertTo?: Movie[]) {
    const changed = base.filter((m) => rankById.has(m.id) && m.rank !== rankById.get(m.id))
    const next = base
      .map((m) => (rankById.has(m.id) ? { ...m, rank: rankById.get(m.id)! } : m))
      .sort(byRank)
    setMovies(next)

    if (changed.length === 0) {
      setError(null)
      return
    }

    const results = await Promise.all(
      changed.map((m) => api.patch(`/movies/${m.id}`, { rank: rankById.get(m.id) })),
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      if (revertTo) {
        setMovies(revertTo)
      } else {
        await refresh()
      }
      setError(failed.error.message)
      return
    }
    setError(null)
  }

  // Renumbers a holiday's ranked movies 1..N so a vacated rank doesn't leave a gap.
  async function closeRankGap(currentMovies: Movie[], holiday: Movie['holiday']) {
    const rankById = new Map(
      rankedInOrder(currentMovies, holiday).map((m, index) => [m.id, index + 1]),
    )
    await persistRanks(currentMovies, rankById)
  }

  async function addMovie(draft: MovieDraft) {
    const posterUrl = draft.posterUrl?.trim() || (await fetchPosterUrl(draft.title, draft.year))
    const { data, error: insertError } = await api.post<MovieRow>('/movies', {
      ...draftToRow(draft),
      poster_url: posterUrl,
    })

    if (insertError) {
      setError(insertError.message)
      return
    }
    setError(null)
    setMovies((prev) => [...prev, rowToMovie(normalizeRow(data as MovieRow))].sort(byRank))
  }

  async function updateMovie(id: string, draft: MovieDraft) {
    const previous = movies.find((m) => m.id === id)
    const titleChanged = previous?.title !== draft.title || previous?.year !== draft.year
    const manualPoster = draft.posterUrl?.trim()
    const posterCleared = draft.posterUrl === ''
    const posterUrl =
      manualPoster ||
      (titleChanged || posterCleared ? await fetchPosterUrl(draft.title, draft.year) : previous?.posterUrl)
    const { data, error: updateError } = await api.put<MovieRow>(`/movies/${id}`, {
      ...draftToRow(draft),
      poster_url: posterUrl,
    })

    if (updateError) {
      setError(updateError.message)
      return
    }

    const updated = rowToMovie(normalizeRow(data as MovieRow))
    const nextMovies = movies.map((m) => (m.id === id ? updated : m)).sort(byRank)

    if (previous && previous.rank < UNRANKED && updated.rank >= UNRANKED) {
      await closeRankGap(nextMovies, previous.holiday)
      return
    }

    setError(null)
    setMovies(nextMovies)
  }

  async function deleteMovie(id: string) {
    const target = movies.find((m) => m.id === id)
    const { error: deleteError } = await api.delete(`/movies/${id}`)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    const remaining = movies.filter((m) => m.id !== id)

    if (!target || target.rank >= UNRANKED) {
      setError(null)
      setMovies(remaining)
      return
    }

    await closeRankGap(remaining, target.holiday)
  }

  async function toggleWatched(id: string) {
    const movie = movies.find((m) => m.id === id)
    if (!movie) return

    const { data, error: updateError } = await api.patch<MovieRow>(`/movies/${id}/toggle-watched`)

    if (updateError) {
      setError(updateError.message)
      return
    }
    setError(null)
    setMovies((prev) =>
      prev.map((m) => (m.id === id ? rowToMovie(normalizeRow(data as MovieRow)) : m)),
    )
  }

  async function setWatchWindow(id: string, watchWindow: WatchWindow) {
    const previous = movies
    setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, watchWindow } : m)))

    const { error: patchError } = await api.patch(`/movies/${id}`, { watch_window: watchWindow })
    if (patchError) {
      setMovies(previous)
      setError(patchError.message)
      return
    }
    setError(null)
  }

  // Both calendar actions return the holiday's movies with their new slots.
  async function changeCalendar(holidayId: number, action: 'auto-calculate-calendar' | 'clear-calendar') {
    const { data, error: postError } = await api.post<MovieRow[]>(`/holidays/${holidayId}/${action}`, {})
    if (postError || !data) {
      setError(postError?.message ?? 'Could not update the calendar')
      return
    }
    setError(null)
    const updated = new Map(data.map(normalizeRow).map(rowToMovie).map((m) => [m.id, m]))
    setMovies((prev) => prev.map((m) => updated.get(m.id) ?? m))
  }

  const autoCalculateCalendar = (holidayId: number) => changeCalendar(holidayId, 'auto-calculate-calendar')
  // Only resets the slots to 'month_away'; never deletes a movie.
  const clearCalendar = (holidayId: number) => changeCalendar(holidayId, 'clear-calendar')

  async function reorderMovies(orderedIds: string[], movedIds?: string | string[]) {
    const moved = new Set(movedIds === undefined ? [] : [movedIds].flat())
    const previous = movies
    const rankById = new Map<string, number>()
    let nextRank = 1
    for (const id of orderedIds) {
      const movie = previous.find((m) => m.id === id)
      if (!movie) continue
      // Only movies that were already ranked (and the ones just moved or compared) take a spot.
      rankById.set(id, movie.rank < UNRANKED || moved.has(id) ? nextRank++ : UNRANKED)
    }
    await persistRanks(previous, rankById, previous)
  }

  async function setMovieRank(id: string, requestedRank: number) {
    const target = movies.find((m) => m.id === id)
    if (!target) return

    // Insert the movie at the requested spot among its holiday's ranked movies, then renumber
    // from 1 so everything below it bumps down one. 100 (or more) means unranked.
    const others = rankedInOrder(movies, target.holiday, id)
    const rankById = new Map<string, number>()
    if (requestedRank >= UNRANKED) {
      others.forEach((m, index) => rankById.set(m.id, index + 1))
      rankById.set(id, UNRANKED)
    } else {
      const insertAt = Math.min(Math.max(requestedRank, 1), others.length + 1) - 1
      const ordered = [...others.slice(0, insertAt), target, ...others.slice(insertAt)]
      ordered.forEach((m, index) => rankById.set(m.id, index + 1))
    }
    await persistRanks(movies, rankById, movies)
  }
  return {
    movies,
    loading,
    error,
    addMovie,
    updateMovie,
    deleteMovie,
    toggleWatched,
    setWatchWindow,
    autoCalculateCalendar,
    clearCalendar,
    reorderMovies,
    setMovieRank,
  }
}

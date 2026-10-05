import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/apiClient'
import { fetchPosterUrl } from '../lib/tmdb'
import type { Movie, MovieDraft, MovieRow } from '../types'

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
      setMovies((data ?? []).map(normalizeRow).map(rowToMovie))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function closeRankGap(currentMovies: Movie[], vacatedRank: number, holiday: Movie['holiday']) {
    const toShift = currentMovies.filter(
      (m): m is Movie & { rank: number } =>
        m.rank !== null && m.rank > vacatedRank && m.holiday === holiday,
    )

    if (toShift.length === 0) {
      setError(null)
      setMovies(currentMovies)
      return
    }

    const shiftedRankById = new Map(toShift.map((m) => [m.id, m.rank - 1]))
    setMovies(
      currentMovies.map((m) =>
        shiftedRankById.has(m.id) ? { ...m, rank: shiftedRankById.get(m.id)! } : m,
      ),
    )

    const results = await Promise.all(
      toShift.map((m) => api.patch(`/movies/${m.id}`, { rank: m.rank - 1 })),
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      await refresh()
      setError(failed.error.message)
      return
    }
    setError(null)
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
    setMovies((prev) => [...prev, rowToMovie(normalizeRow(data as MovieRow))])
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
    const nextMovies = movies.map((m) => (m.id === id ? updated : m))

    if (previous?.rank != null && updated.rank === null) {
      await closeRankGap(nextMovies, previous.rank, previous.holiday)
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

    if (target?.rank == null) {
      setError(null)
      setMovies(remaining)
      return
    }

    await closeRankGap(remaining, target.rank, target.holiday)
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

  async function reorderMovies(orderedIds: string[]) {
    const previous = movies
    const rankById = new Map(orderedIds.map((id, index) => [id, index + 1]))
    const reordered = orderedIds
      .map((id) => previous.find((m) => m.id === id))
      .filter((m): m is Movie => !!m)

    setMovies(reordered.map((m) => ({ ...m, rank: rankById.get(m.id) ?? m.rank })))

    const results = await Promise.all(
      orderedIds.map((id) => api.patch(`/movies/${id}`, { rank: rankById.get(id) })),
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      setError(failed.error.message)
      setMovies(previous)
      return
    }
    setError(null)
  }

  return {
    movies,
    loading,
    error,
    addMovie,
    updateMovie,
    deleteMovie,
    toggleWatched,
    reorderMovies,
  }
}

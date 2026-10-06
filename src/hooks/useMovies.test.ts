import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import type { MovieRow } from '../types'

const { api } = vi.hoisted(() => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))
const { fetchPosterUrl } = vi.hoisted(() => ({ fetchPosterUrl: vi.fn() }))

vi.mock('../lib/apiClient', () => ({ api }))
vi.mock('../lib/tmdb', () => ({ fetchPosterUrl }))

const { useMovies } = await import('./useMovies')

function ok<T>(data: T) {
  return { data, error: null }
}

function fail(message: string) {
  return { data: null, error: { message } }
}

const row: MovieRow = {
  id: '1',
  title: 'Hocus Pocus',
  year: 1993,
  added_by: 'Both',
  rating: 5,
  genre: 'Fantasy',
  decade: '1990s',
  holiday: 'Halloween',
  rank: 100,
  watch_window: 'month_away',
  watched: true,
  notes: 'Annual tradition.',
  created_at: '2024-01-01',
  poster_url: null,
  movie_actor: [{ actors: { name: 'Sarah Jessica Parker' } }, { actors: { name: 'Bette Midler' } }],
}

beforeEach(() => {
  api.get.mockReset()
  api.post.mockReset()
  api.put.mockReset()
  api.patch.mockReset()
  api.delete.mockReset()
  fetchPosterUrl.mockReset()
  fetchPosterUrl.mockResolvedValue(null)
})

describe('useMovies', () => {
  it('loads movies on mount, maps rows, and sorts cast names', async () => {
    api.get.mockResolvedValue(ok([row]))
    const { result } = renderHook(() => useMovies())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
    expect(result.current.movies).toEqual([
      {
        id: '1',
        title: 'Hocus Pocus',
        year: 1993,
        addedBy: 'Both',
        rating: 5,
        genre: 'Fantasy',
        decade: '1990s',
        holiday: 'Halloween',
        rank: 100,
        watchWindow: 'month_away',
        watched: true,
        notes: 'Annual tradition.',
        posterUrl: null,
        cast: ['Bette Midler', 'Sarah Jessica Parker'],
      },
    ])
  })

  it('falls back to empty strings for null year/genre/decade and an empty cast array', async () => {
    const bareRow: MovieRow = { ...row, year: null, genre: null, decade: null, movie_actor: [] }
    api.get.mockResolvedValue(ok([bareRow]))
    const { result } = renderHook(() => useMovies())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.movies[0]).toMatchObject({ year: '', genre: '', decade: '', cast: [] })
  })

  it('sets an error message when the initial fetch fails', async () => {
    api.get.mockResolvedValue(fail('network down'))
    const { result } = renderHook(() => useMovies())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('network down')
    expect(result.current.movies).toEqual([])
  })

  it('addMovie appends the newly inserted movie on success', async () => {
    api.get.mockResolvedValue(ok([]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.post.mockResolvedValue(ok(row))
    await act(async () => {
      await result.current.addMovie({
        title: 'Hocus Pocus',
        year: 1993,
        addedBy: 'Both',
        rating: 5,
        genre: 'Fantasy',
        decade: '1990s',
        holiday: 'Halloween',
        rank: 100,
        watchWindow: 'month_away',
        watched: true,
        notes: 'Annual tradition.',
      })
    })

    expect(result.current.movies).toHaveLength(1)
    expect(result.current.movies[0].title).toBe('Hocus Pocus')
    expect(result.current.error).toBeNull()
  })

  it('addMovie sets an error and leaves the list unchanged on failure', async () => {
    api.get.mockResolvedValue(ok([]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.post.mockResolvedValue(fail('insert failed'))
    await act(async () => {
      await result.current.addMovie({
        title: 'Bad Movie',
        year: '',
        addedBy: 'His',
        rating: 0,
        genre: '',
        decade: '',
        holiday: 'Halloween',
        rank: 100,
        watchWindow: 'month_away',
        watched: false,
        notes: '',
      })
    })

    expect(result.current.movies).toEqual([])
    expect(result.current.error).toBe('insert failed')
  })

  it('updateMovie applies the server response without shifting ranks for a normal edit', async () => {
    api.get.mockResolvedValue(ok([row]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.put.mockResolvedValue(ok({ ...row, title: 'New Title' }))
    await act(async () => {
      await result.current.updateMovie('1', {
        title: 'New Title',
        year: row.year ?? '',
        addedBy: row.added_by,
        rating: row.rating,
        genre: row.genre ?? '',
        decade: row.decade ?? '',
        holiday: row.holiday,
        rank: row.rank,
        watchWindow: 'month_away',
        watched: row.watched,
        notes: row.notes,
      })
    })

    expect(api.put).toHaveBeenCalledTimes(1)
    expect(result.current.movies[0].title).toBe('New Title')
    expect(result.current.error).toBeNull()
  })

  it('updateMovie closes the rank gap when a ranked movie is edited back to unranked', async () => {
    const rowA: MovieRow = { ...row, id: 'a', rank: 1 }
    const rowB: MovieRow = { ...row, id: 'b', rank: 2 }
    const rowC: MovieRow = { ...row, id: 'c', rank: 3 }
    api.get.mockResolvedValue(ok([rowA, rowB, rowC]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.put.mockResolvedValue(ok({ ...rowA, rank: 100 }))
    api.patch.mockResolvedValue(ok(undefined))

    await act(async () => {
      await result.current.updateMovie('a', {
        title: rowA.title,
        year: rowA.year ?? '',
        addedBy: rowA.added_by,
        rating: rowA.rating,
        genre: rowA.genre ?? '',
        decade: rowA.decade ?? '',
        holiday: rowA.holiday,
        rank: 100,
        watchWindow: 'month_away',
        watched: rowA.watched,
        notes: rowA.notes,
      })
    })

    const ranks = Object.fromEntries(result.current.movies.map((m) => [m.id, m.rank]))
    expect(ranks).toEqual({ a: 100, b: 1, c: 2 })
    expect(api.patch).toHaveBeenCalledWith('/movies/b', { rank: 1 })
    expect(api.patch).toHaveBeenCalledWith('/movies/c', { rank: 2 })
    expect(result.current.error).toBeNull()
  })

  it('deleteMovie removes the movie from state on success', async () => {
    api.get.mockResolvedValue(ok([row]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.delete.mockResolvedValue(ok(undefined))
    await act(async () => {
      await result.current.deleteMovie('1')
    })

    expect(result.current.movies).toEqual([])
  })

  it('deleteMovie closes the rank gap by shifting down the ranks of movies below the deleted one', async () => {
    const rowA: MovieRow = { ...row, id: 'a', rank: 1 }
    const rowB: MovieRow = { ...row, id: 'b', rank: 2 }
    const rowC: MovieRow = { ...row, id: 'c', rank: 3 }
    api.get.mockResolvedValue(ok([rowA, rowB, rowC]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.delete.mockResolvedValue(ok(undefined))
    api.patch.mockResolvedValue(ok(undefined))

    await act(async () => {
      await result.current.deleteMovie('a')
    })

    const ranks = Object.fromEntries(result.current.movies.map((m) => [m.id, m.rank]))
    expect(ranks).toEqual({ b: 1, c: 2 })
    expect(api.patch).toHaveBeenCalledWith('/movies/b', { rank: 1 })
    expect(api.patch).toHaveBeenCalledWith('/movies/c', { rank: 2 })
    expect(result.current.error).toBeNull()
  })

  it('deleteMovie does not shift ranks when the deleted movie was unranked', async () => {
    const rowA: MovieRow = { ...row, id: 'a', rank: 1 }
    const rowB: MovieRow = { ...row, id: 'b', rank: 100 }
    api.get.mockResolvedValue(ok([rowA, rowB]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.delete.mockResolvedValue(ok(undefined))
    await act(async () => {
      await result.current.deleteMovie('b')
    })

    expect(result.current.movies).toEqual([expect.objectContaining({ id: 'a', rank: 1 })])
  })

  it('deleteMovie surfaces an error and re-fetches if closing the rank gap fails to persist', async () => {
    const rowA: MovieRow = { ...row, id: 'a', rank: 1 }
    const rowB: MovieRow = { ...row, id: 'b', rank: 2 }
    api.get.mockResolvedValueOnce(ok([rowA, rowB])).mockResolvedValueOnce(ok([rowB]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.delete.mockResolvedValue(ok(undefined))
    api.patch.mockResolvedValue(fail('update failed'))

    await act(async () => {
      await result.current.deleteMovie('a')
    })

    expect(result.current.error).toBe('update failed')
    expect(result.current.movies).toEqual([expect.objectContaining({ id: 'b', rank: 2 })])
  })

  it('toggleWatched flips the watched flag returned by the server', async () => {
    api.get.mockResolvedValue(ok([row]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.patch.mockResolvedValue(ok({ ...row, watched: false }))
    await act(async () => {
      await result.current.toggleWatched('1')
    })

    expect(result.current.movies[0].watched).toBe(false)
  })

  it('toggleWatched is a no-op for an unknown id', async () => {
    api.get.mockResolvedValue(ok([row]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.patch.mockClear()
    await act(async () => {
      await result.current.toggleWatched('does-not-exist')
    })

    expect(api.patch).not.toHaveBeenCalled()
  })

  it('reorderMovies recomputes sequential ranks and persists them per-row', async () => {
    const rowA: MovieRow = { ...row, id: 'a', rank: 1 }
    const rowB: MovieRow = { ...row, id: 'b', rank: 2 }
    api.get.mockResolvedValue(ok([rowA, rowB]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.patch.mockResolvedValue(ok(undefined))
    await act(async () => {
      await result.current.reorderMovies(['b', 'a'])
    })

    expect(result.current.movies.map((m) => m.id)).toEqual(['b', 'a'])
    expect(result.current.movies[0].rank).toBe(1)
    expect(result.current.movies[1].rank).toBe(2)
    expect(api.patch).toHaveBeenCalledWith('/movies/b', { rank: 1 })
    expect(api.patch).toHaveBeenCalledWith('/movies/a', { rank: 2 })
    expect(result.current.error).toBeNull()
  })

  it('reorderMovies reverts to the previous order and sets an error if a persist call fails', async () => {
    const rowA: MovieRow = { ...row, id: 'a', rank: 1 }
    const rowB: MovieRow = { ...row, id: 'b', rank: 2 }
    api.get.mockResolvedValue(ok([rowA, rowB]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.patch.mockResolvedValueOnce(ok(undefined)).mockResolvedValueOnce(fail('update failed'))

    await act(async () => {
      await result.current.reorderMovies(['b', 'a'])
    })

    expect(result.current.movies.map((m) => m.id)).toEqual(['a', 'b'])
    expect(result.current.error).toBe('update failed')
  })
  it('setMovieRank inserts at the requested rank and bumps the others down, renumbering from 1', async () => {
    const rows: MovieRow[] = [
      { ...row, id: 'a', rank: 1 },
      { ...row, id: 'b', rank: 2 },
      { ...row, id: 'c', rank: 3 },
    ]
    api.get.mockResolvedValue(ok(rows))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.patch.mockResolvedValue(ok(undefined))
    await act(async () => {
      await result.current.setMovieRank('c', 1)
    })

    expect(result.current.movies.map((m) => [m.id, m.rank])).toEqual([
      ['c', 1],
      ['a', 2],
      ['b', 3],
    ])
    expect(api.patch).toHaveBeenCalledTimes(3)
  })

  it('setMovieRank ranks an unranked movie and clamps to the end of the list', async () => {
    const rows: MovieRow[] = [
      { ...row, id: 'a', rank: 1 },
      { ...row, id: 'b', rank: 100 },
    ]
    api.get.mockResolvedValue(ok(rows))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.patch.mockResolvedValue(ok(undefined))
    await act(async () => {
      await result.current.setMovieRank('b', 99)
    })

    expect(result.current.movies.map((m) => [m.id, m.rank])).toEqual([
      ['a', 1],
      ['b', 2],
    ])
    expect(api.patch).toHaveBeenCalledTimes(1)
    expect(api.patch).toHaveBeenCalledWith('/movies/b', { rank: 2 })
  })
  it('setMovieRank with 100 unranks the movie and closes the gap without touching other unranked movies', async () => {
    const rows: MovieRow[] = [
      { ...row, id: 'a', rank: 1 },
      { ...row, id: 'b', rank: 2 },
      { ...row, id: 'c', rank: 100 },
    ]
    api.get.mockResolvedValue(ok(rows))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.patch.mockResolvedValue(ok(undefined))
    await act(async () => {
      await result.current.setMovieRank('a', 100)
    })

    expect(result.current.movies.map((m) => [m.id, m.rank])).toEqual([
      ['b', 1],
      ['a', 100],
      ['c', 100],
    ])
    expect(api.patch).toHaveBeenCalledTimes(2)
  })

  it('reorderMovies ranks the dragged unranked movie but leaves other unranked movies at 100', async () => {
    const rows: MovieRow[] = [
      { ...row, id: 'a', rank: 1 },
      { ...row, id: 'b', rank: 100 },
      { ...row, id: 'c', rank: 100 },
    ]
    api.get.mockResolvedValue(ok(rows))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.patch.mockResolvedValue(ok(undefined))
    await act(async () => {
      await result.current.reorderMovies(['b', 'a', 'c'], 'b')
    })

    expect(result.current.movies.map((m) => [m.id, m.rank])).toEqual([
      ['b', 1],
      ['a', 2],
      ['c', 100],
    ])
  })

  it('setWatchWindow moves the movie right away and saves it', async () => {
    api.get.mockResolvedValue(ok([row]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.patch.mockResolvedValue(ok({ ...row, watch_window: 'day_of' }))
    await act(async () => {
      await result.current.setWatchWindow('1', 'day_of')
    })

    expect(api.patch).toHaveBeenCalledWith('/movies/1', { watch_window: 'day_of' })
    expect(result.current.movies[0].watchWindow).toBe('day_of')
  })

  it('setWatchWindow reverts and reports the error when saving fails', async () => {
    api.get.mockResolvedValue(ok([row]))
    const { result } = renderHook(() => useMovies())
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.patch.mockResolvedValue(fail('nope'))
    await act(async () => {
      await result.current.setWatchWindow('1', 'day_of')
    })

    expect(result.current.movies[0].watchWindow).toBe('month_away')
    expect(result.current.error).toBe('nope')
  })
})

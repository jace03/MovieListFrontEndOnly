import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import type { Movie } from './types'

const movies: Movie[] = [
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
    notes: '',
    cast: [],
    posterUrl: null,
  },
  {
    id: '2',
    title: 'Halloween Night',
    year: 1978,
    addedBy: 'His',
    rating: 4,
    genre: 'Horror',
    decade: '1970s',
    holiday: 'Halloween',
    rank: 100,
    watchWindow: 'month_away',
    watched: false,
    notes: '',
    cast: [],
    posterUrl: null,
  },
]

const addMovie = vi.fn()
const updateMovie = vi.fn()
const deleteMovie = vi.fn()
const toggleWatched = vi.fn()
const reorderMovies = vi.fn()
const setMovieRank = vi.fn()
const useMoviesMock = vi.fn()

vi.mock('./hooks/useHolidays', () => ({
  useHolidays: () => ({
    holidays: [
      { id: 1, name: 'Halloween', emoji: '🎃' },
      { id: 2, name: 'Christmas', emoji: '🎄' },
    ],
  }),
}))

vi.mock('./hooks/useMovies', () => ({
  useMovies: () => useMoviesMock(),
}))

function setHookState(overrides: Record<string, unknown> = {}) {
  useMoviesMock.mockReturnValue({
    movies,
    loading: false,
    error: null,
    addMovie,
    updateMovie,
    deleteMovie,
    toggleWatched,
    reorderMovies,
    setMovieRank,
    ...overrides,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  setHookState()
})

function startDragFromHandle(item: HTMLElement) {
  fireEvent.mouseDown(within(item).getByLabelText('Drag to reorder'))
  fireEvent.dragStart(item)
}

describe('App', () => {
  it('shows a loading state', () => {
    setHookState({ loading: true })
    render(<App />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows the empty state when there are no movies', () => {
    setHookState({ movies: [] })
    render(<App />)
    expect(screen.getByText('No movies here yet — add one above!')).toBeInTheDocument()
  })

  it('shows the total and watched counts in the header', () => {
    render(<App />)
    expect(screen.getByText('2 movies · 1 watched')).toBeInTheDocument()
  })

  it('renders all movies by default', () => {
    render(<App />)
    expect(screen.getByText('Hocus Pocus')).toBeInTheDocument()
    expect(screen.getByText('Halloween Night')).toBeInTheDocument()
  })

  it('filters to unwatched movies', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Unwatched' }))
    expect(screen.queryByText('Hocus Pocus')).not.toBeInTheDocument()
    expect(screen.getByText('Halloween Night')).toBeInTheDocument()
  })

  it('filters to watched movies', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Watched' }))
    expect(screen.getByText('Hocus Pocus')).toBeInTheDocument()
    expect(screen.queryByText('Halloween Night')).not.toBeInTheDocument()
  })

  it('shows the server error message when present', () => {
    setHookState({ error: 'timeout' })
    render(<App />)
    expect(screen.getByText('Something went wrong talking to the server: timeout')).toBeInTheDocument()
  })

  it('calls addMovie when submitting the form in Add mode', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('tab', { name: 'Add a movie' }))
    await userEvent.type(screen.getByLabelText('Title'), 'Trick R Treat')
    await userEvent.click(screen.getByRole('button', { name: 'Add movie' }))
    expect(addMovie).toHaveBeenCalledWith(expect.objectContaining({ title: 'Trick R Treat' }))
  })

  it('switches to Edit mode, calls updateMovie on save, and returns to Add mode', async () => {
    render(<App />)
    const editButtons = screen.getAllByText('Edit')
    await userEvent.click(editButtons[0])
    expect(screen.getByRole('heading', { name: 'Edit movie' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(updateMovie).toHaveBeenCalledWith('1', expect.objectContaining({ title: 'Hocus Pocus' }))
    expect(screen.getByRole('heading', { name: 'Add a movie' })).toBeInTheDocument()
  })

  it('clears an in-progress edit when that same movie is deleted', async () => {
    render(<App />)
    const editButtons = screen.getAllByText('Edit')
    await userEvent.click(editButtons[0])
    expect(screen.getByRole('heading', { name: 'Edit movie' })).toBeInTheDocument()

    const deleteButtons = screen.getAllByText('Delete')
    await userEvent.click(deleteButtons[0])
    expect(deleteMovie).toHaveBeenCalledWith('1')
    expect(screen.getByRole('heading', { name: 'Add a movie' })).toBeInTheDocument()
  })

  it('makes cards draggable when a holiday tab is active', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('tab', { name: 'Halloween' }))
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveAttribute('draggable', 'true')
    expect(items[1]).toHaveAttribute('draggable', 'true')
  })

  it('loads on the All tab with dragging disabled', () => {
    render(<App />)
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true')
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveAttribute('draggable', 'false')
    expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument()
  })

  it('hides rank badges on the All tab but shows them on a holiday tab', async () => {
    setHookState({ movies: movies.map((m, i) => ({ ...m, rank: i + 1 })) })
    render(<App />)
    expect(screen.queryByText('#1')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: 'Halloween' }))
    expect(screen.getByText('#1')).toBeInTheDocument()
  })

  it('lets you click a rank on a holiday tab, flags taken ranks red and free ranks green, and saves on Enter', async () => {
    setHookState({ movies: movies.map((m, i) => ({ ...m, rank: i + 1 })) })
    render(<App />)
    await userEvent.click(screen.getByRole('tab', { name: 'Halloween' }))

    await userEvent.click(screen.getByRole('button', { name: 'Rank 2, click to change' }))
    const input = screen.getByLabelText('New rank')
    await userEvent.clear(input)
    await userEvent.type(input, '1')
    expect(input).toHaveClass('rank-taken')

    await userEvent.clear(input)
    await userEvent.type(input, '5')
    expect(input).toHaveClass('rank-free')

    await userEvent.clear(input)
    await userEvent.type(input, '1{Enter}')
    expect(setMovieRank).toHaveBeenCalledWith('2', 1)
  })

  it('does not let you edit ranks on the All tab', () => {
    setHookState({ movies: movies.map((m, i) => ({ ...m, rank: i + 1 })) })
    render(<App />)
    expect(screen.queryByRole('button', { name: /click to change/ })).not.toBeInTheDocument()
  })

  it('disables dragging when a Watched/Unwatched filter is active', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Unwatched' }))
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveAttribute('draggable', 'false')
  })

  it('reorders on drag-and-drop from the handle and calls reorderMovies with the new id order', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('tab', { name: 'Halloween' }))
    const items = screen.getAllByRole('listitem')

    startDragFromHandle(items[0])
    fireEvent.dragEnter(items[1])
    fireEvent.drop(items[1])
    fireEvent.dragEnd(items[1])

    expect(reorderMovies).toHaveBeenCalledWith(['2', '1'], '1')
  })

  it('does not start a drag from outside the handle', () => {
    render(<App />)
    const items = screen.getAllByRole('listitem')

    fireEvent.dragStart(items[0])
    fireEvent.dragEnter(items[1])
    fireEvent.drop(items[1])
    fireEvent.dragEnd(items[1])

    expect(reorderMovies).not.toHaveBeenCalled()
  })

  it('clears drag state when the card being dragged is deleted mid-drag', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('tab', { name: 'Halloween' }))
    const items = screen.getAllByRole('listitem')

    startDragFromHandle(items[0])
    expect(items[0]).toHaveClass('dragging')

    const deleteButtons = screen.getAllByText('Delete')
    await userEvent.click(deleteButtons[0])

    expect(items[0]).not.toHaveClass('dragging')
  })

  it('defaults to 1 column and persists a column change to localStorage', async () => {
    render(<App />)
    expect(screen.getByRole('list')).toHaveAttribute('data-columns', '1')

    await userEvent.click(screen.getByRole('button', { name: '3' }))
    expect(screen.getByRole('list')).toHaveAttribute('data-columns', '3')
    expect(localStorage.getItem('movie-list-columns')).toBe('3')
  })

  it('restores the column count from localStorage', () => {
    localStorage.setItem('movie-list-columns', '2')
    render(<App />)
    expect(screen.getByRole('list')).toHaveAttribute('data-columns', '2')
  })

  it('disables dragging once more than 1 column is selected, even under the All filter', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: '2' }))
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveAttribute('draggable', 'false')
    expect(within(items[0]).queryByLabelText('Drag to reorder')).not.toBeInTheDocument()
  })
})

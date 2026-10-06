import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MovieCard } from './MovieCard'
import type { Movie } from '../types'

const baseMovie: Movie = {
  id: '1',
  title: 'Hocus Pocus',
  year: 1993,
  addedBy: 'Both',
  rating: 5,
  genre: 'Fantasy',
  decade: '1990s',
  holiday: 'Halloween',
  rank: 2,
  watchWindow: 'month_away',
  watched: true,
  notes: 'Annual tradition.',
  cast: ['Bette Midler', 'Sarah Jessica Parker'],
  posterUrl: null,
}

function renderCard(overrides: Partial<Movie> = {}, cardProps: Record<string, unknown> = {}) {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  const onToggleWatched = vi.fn()
  const { unmount } = render(
    <MovieCard
      movie={{ ...baseMovie, ...overrides }}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleWatched={onToggleWatched}
      {...cardProps}
    />,
  )
  return { onEdit, onDelete, onToggleWatched, unmount }
}

describe('MovieCard', () => {
  it('shows the year next to the title when a year is set', () => {
    renderCard({ year: 1993 })
    expect(screen.getByText('(1993)')).toBeInTheDocument()
  })

  it('omits the year when it is an empty string', () => {
    renderCard({ year: '' })
    expect(screen.queryByText(/^\(\d{4}\)$/)).not.toBeInTheDocument()
  })

  it('shows a rank badge only when the movie has a rank', () => {
    renderCard({ rank: 1 })
    expect(screen.getByText('#1')).toBeInTheDocument()
  })

  it('hides the rank badge when rank is null', () => {
    renderCard({ rank: 100 })
    expect(screen.queryByText(/^#\d+$/)).not.toBeInTheDocument()
  })

  it('renders the addedBy badge text', () => {
    renderCard({ addedBy: 'Hers' })
    expect(screen.getByText('Hers')).toBeInTheDocument()
  })

  it('renders genre and decade tags when present', () => {
    renderCard({ genre: 'Horror', decade: '1980s' })
    expect(screen.getByText('Horror')).toBeInTheDocument()
    expect(screen.getByText('1980s')).toBeInTheDocument()
  })

  it('omits the tags block when genre and decade are both empty', () => {
    renderCard({ genre: '', decade: '' })
    expect(screen.queryByText('Horror')).not.toBeInTheDocument()
    expect(screen.queryByText('1980s')).not.toBeInTheDocument()
  })

  it('joins cast names with commas', () => {
    renderCard({ cast: ['Winona Ryder', 'Michael Keaton'] })
    expect(screen.getByText('Cast: Winona Ryder, Michael Keaton')).toBeInTheDocument()
  })

  it('omits the cast line when cast is empty', () => {
    renderCard({ cast: [] })
    expect(screen.queryByText(/^Cast:/)).not.toBeInTheDocument()
  })

  it('shows notes when present and omits them when blank', () => {
    const { unmount } = renderCard({ notes: 'Spooky pick' })
    expect(screen.getByText('Spooky pick')).toBeInTheDocument()
    unmount()

    renderCard({ notes: '' })
    expect(screen.queryByText('Spooky pick')).not.toBeInTheDocument()
  })

  it('applies the watched class when watched', () => {
    renderCard({ watched: true })
    expect(screen.getByRole('listitem')).toHaveClass('watched')
  })

  it('does not apply the watched class when unwatched', () => {
    renderCard({ watched: false })
    expect(screen.getByRole('listitem')).not.toHaveClass('watched')
  })

  it('calls onToggleWatched with the movie id when the checkbox is clicked', async () => {
    const { onToggleWatched } = renderCard({ id: 'abc', watched: false })
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onToggleWatched).toHaveBeenCalledWith('abc')
  })

  it('calls onEdit with the full movie when Edit is clicked', async () => {
    const movie = { ...baseMovie, id: 'xyz' }
    const onEdit = vi.fn()
    render(<MovieCard movie={movie} onEdit={onEdit} onDelete={vi.fn()} onToggleWatched={vi.fn()} />)
    await userEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(movie)
  })

  it('calls onDelete with the movie id when Delete is clicked', async () => {
    const { onDelete } = renderCard({ id: 'del-1' })
    await userEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('del-1')
  })

  it('is not draggable by default', () => {
    renderCard({ id: 'a' })
    expect(screen.getByRole('listitem')).toHaveAttribute('draggable', 'false')
  })

  it('is draggable when draggable is true', () => {
    renderCard({ id: 'a' }, { draggable: true })
    expect(screen.getByRole('listitem')).toHaveAttribute('draggable', 'true')
  })

  it('does not start a drag when it begins outside the handle', () => {
    const onDragStart = vi.fn()
    render(
      <MovieCard
        movie={{ ...baseMovie, id: 'a' }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleWatched={vi.fn()}
        draggable
        onDragStart={onDragStart}
      />,
    )
    fireEvent.dragStart(screen.getByRole('heading'))
    expect(onDragStart).not.toHaveBeenCalled()
  })

  it('calls onDragStart with the movie id when a drag begins from the handle', () => {
    const onDragStart = vi.fn()
    render(
      <MovieCard
        movie={{ ...baseMovie, id: 'a' }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleWatched={vi.fn()}
        draggable
        onDragStart={onDragStart}
      />,
    )
    fireEvent.mouseDown(screen.getByLabelText('Drag to reorder'))
    fireEvent.dragStart(screen.getByRole('listitem'))
    expect(onDragStart).toHaveBeenCalledWith('a')
  })

  it('does not render a drag handle when draggable is false', () => {
    renderCard({ id: 'a' })
    expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument()
  })

  it('calls onDragEnter, onDrop, and onDragEnd with the movie id', () => {
    const onDragEnter = vi.fn()
    const onDrop = vi.fn()
    const onDragEnd = vi.fn()
    render(
      <MovieCard
        movie={{ ...baseMovie, id: 'a' }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleWatched={vi.fn()}
        draggable
        onDragEnter={onDragEnter}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      />,
    )
    const item = screen.getByRole('listitem')
    fireEvent.dragEnter(item)
    fireEvent.drop(item)
    fireEvent.dragEnd(item)

    expect(onDragEnter).toHaveBeenCalledWith('a')
    expect(onDrop).toHaveBeenCalledWith('a')
    expect(onDragEnd).toHaveBeenCalled()
  })

  it('applies dragging and drop-target classes', () => {
    renderCard({ id: 'a' })
    expect(screen.getByRole('listitem')).not.toHaveClass('dragging')
    expect(screen.getByRole('listitem')).not.toHaveClass('drop-target')
  })

  it('renders the poster image when posterUrl is set', () => {
    renderCard({ posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg' })
    const poster = screen.getByRole('img')
    expect(poster).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/poster.jpg')
  })

  it('renders a placeholder when posterUrl is null', () => {
    renderCard({ posterUrl: null }, { holidayEmoji: '🎃' })
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('🎃')).toBeInTheDocument()
  })
})

import { createEvent, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { HolidayInfo, Movie } from '../types'
import { RankMovies } from './RankMovies'

const holidays = [
  { id: 1, name: 'Halloween', emoji: '🎃' },
  { id: 2, name: 'Christmas', emoji: '🎄' },
] as HolidayInfo[]

function movie(id: string, title: string, rank: number, holiday = 'Halloween'): Movie {
  return { id, title, rank, holiday, year: 2000, watched: false, addedBy: 'Both' } as Movie
}

describe('RankMovies', () => {
  it('lists the first holiday by rank', () => {
    render(
      <RankMovies
        movies={[movie('b', 'Beta', 2), movie('a', 'Alpha', 1), movie('x', 'Xmas', 1, 'Christmas')]}
        holidays={holidays}
        onReorder={vi.fn()}
        onSetRank={vi.fn()}
      />,
    )
    const titles = screen.getAllByRole('listitem').map((li) => li.textContent)
    expect(titles[0]).toContain('Alpha')
    expect(titles[1]).toContain('Beta')
    expect(screen.queryByText('Xmas')).toBeNull()
  })

  it('game: picking the lower movie puts it above and ranks both', () => {
    const onReorder = vi.fn()
    render(
      <RankMovies
        movies={[movie('a', 'Alpha', 1), movie('b', 'Beta', 2)]}
        holidays={holidays}
        onReorder={onReorder}
        onSetRank={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Game' }))
    fireEvent.click(screen.getByRole('button', { name: /Beta/ }))
    expect(onReorder).toHaveBeenCalledWith(['b', 'a'], ['b', 'a'])
  })

  it('game: asks for more movies when fewer than two', () => {
    render(
      <RankMovies movies={[movie('a', 'Alpha', 1)]} holidays={holidays} onReorder={vi.fn()} onSetRank={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Game' }))
    expect(screen.getByText(/at least two/i)).toBeInTheDocument()
  })
})

describe('RankMovies move to bottom', () => {
  const movies = [movie('a', 'Alpha', 1), movie('b', 'Beta', 2)]

  it('asks first, then moves the movie to the bottom', () => {
    const onSetRank = vi.fn()
    render(<RankMovies movies={movies} holidays={holidays} onReorder={vi.fn()} onSetRank={onSetRank} />)
    fireEvent.click(screen.getByRole('button', { name: /Move Alpha to the bottom/ }))
    expect(onSetRank).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Move to bottom' }))
    expect(onSetRank).toHaveBeenCalledWith('a', 99)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('cancel leaves the ranking alone', () => {
    const onSetRank = vi.fn()
    render(<RankMovies movies={movies} holidays={holidays} onReorder={vi.fn()} onSetRank={onSetRank} />)
    fireEvent.click(screen.getByRole('button', { name: /Move Alpha to the bottom/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onSetRank).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('RankMovies drag preview', () => {
  const three = [movie('a', 'Alpha', 1), movie('b', 'Beta', 2), movie('c', 'Gamma', 3)]
  const titles = () => screen.getAllByRole('listitem').map((li) => li.querySelector('.rank-title')?.textContent)

  // jsdom has no layout, so lay the cards out as a row of 100px cells; a card's position follows its
  // current place in the list, like real grid cells do.
  function renderGrid(onReorder = vi.fn()) {
    render(<RankMovies movies={three} holidays={holidays} onReorder={onReorder} onSetRank={vi.fn()} />)
    const grid = screen.getByRole('list')
    vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect)
    const place = (cell: Element) => Array.from(grid.children).indexOf(cell)
    Array.from(grid.children).forEach((cell) => {
      Object.defineProperties(cell, {
        offsetLeft: { get: () => place(cell) * 100, configurable: true },
        offsetTop: { value: 0, configurable: true },
        offsetWidth: { value: 100, configurable: true },
        offsetHeight: { value: 100, configurable: true },
      })
    })
    return { grid, cards: screen.getAllByRole('listitem'), onReorder }
  }

  // jsdom drops clientX/Y from drag events, so set them on the event by hand.
  const overCell = (grid: HTMLElement, cell: number) => {
    const event = createEvent.dragOver(grid)
    Object.defineProperties(event, { clientX: { value: cell * 100 + 50 }, clientY: { value: 50 } })
    fireEvent(grid, event)
  }

  it('moves the cards out of the way as soon as you drag over another cell', () => {
    const { grid, cards } = renderGrid()
    fireEvent.dragStart(cards[0])
    overCell(grid, 2)
    expect(titles()).toEqual(['Beta', 'Gamma', 'Alpha'])
  })

  it('judges the target by the cell under the cursor, not by the card that slid there', () => {
    const { grid, cards } = renderGrid()
    fireEvent.dragStart(cards[0])
    overCell(grid, 2)
    overCell(grid, 2)
    expect(titles()).toEqual(['Beta', 'Gamma', 'Alpha'])
    overCell(grid, 1)
    expect(titles()).toEqual(['Beta', 'Alpha', 'Gamma'])
  })

  it('saves the previewed order on drop', () => {
    const { grid, cards, onReorder } = renderGrid()
    fireEvent.dragStart(cards[0])
    overCell(grid, 2)
    fireEvent.drop(grid)
    expect(onReorder).toHaveBeenCalledWith(['b', 'c', 'a'], 'a')
  })

  it('puts everything back if the drag is cancelled', () => {
    const { grid, cards, onReorder } = renderGrid()
    fireEvent.dragStart(cards[0])
    overCell(grid, 2)
    fireEvent.dragEnd(cards[0])
    expect(titles()).toEqual(['Alpha', 'Beta', 'Gamma'])
    expect(onReorder).not.toHaveBeenCalled()
  })
})

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { HolidayInfo, Movie } from '../types'
import { CalendarPlanner } from './CalendarPlanner'

const holidays = [
  { id: 1, name: 'Halloween', emoji: '🎃' },
  { id: 2, name: 'Christmas', emoji: '🎄' },
  { id: 3, name: 'Easter', emoji: '🐣' },
] as HolidayInfo[]

function movie(id: string, title: string, watchWindow: Movie['watchWindow'], holiday = 'Halloween'): Movie {
  return { id, title, holiday, watchWindow, rank: 1, watched: false } as Movie
}

const movies = [
  movie('a', 'Hocus Pocus', 'day_of'),
  movie('b', 'Casper', 'week_of'),
  movie('c', 'Elf', 'day_of', 'Christmas'),
  movie('d', 'Hop', 'month_away', 'Easter'),
]

function setup() {
  const onToggleWatched = vi.fn()
  const onMoveToWindow = vi.fn()
  const onAutoCalculate = vi.fn()
  const onClear = vi.fn()
  render(
    <CalendarPlanner
      movies={movies}
      holidays={holidays}
      onToggleWatched={onToggleWatched}
      onMoveToWindow={onMoveToWindow}
      onAutoCalculate={onAutoCalculate}
      onClear={onClear}
    />,
  )
  return { onToggleWatched, onMoveToWindow, onAutoCalculate, onClear }
}

describe('CalendarPlanner', () => {
  it('shows the five slots as squares, all folded in at first', () => {
    setup()
    for (const label of ['Day of', 'Week of', '2 weeks away', '3 weeks away', 'A month away']) {
      expect(screen.getByRole('button', { name: new RegExp(label) })).toHaveAttribute('aria-expanded', 'false')
    }
    expect(screen.queryByText('Hocus Pocus')).not.toBeVisible()
  })

  it('unfolds a square into that slot’s movies for the chosen holiday', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: /Day of/ }))
    expect(screen.getByText('Hocus Pocus')).toBeVisible()
    expect(screen.queryByText('Elf')).toBeNull()
    expect(screen.queryByText('Casper')).not.toBeVisible()
  })

  it('shows another holiday’s movies when its tab is picked', () => {
    setup()
    fireEvent.click(screen.getByRole('tab', { name: 'Christmas' }))
    fireEvent.click(screen.getByRole('button', { name: /Day of/ }))
    expect(screen.getByText('Elf')).toBeVisible()
  })

  it('checks a movie off as watched', () => {
    const { onToggleWatched } = setup()
    fireEvent.click(screen.getByRole('button', { name: /Day of/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Hocus Pocus watched' }))
    expect(onToggleWatched).toHaveBeenCalledWith('a')
  })

  it('moves a movie to a different slot', () => {
    const { onMoveToWindow } = setup()
    fireEvent.click(screen.getByRole('button', { name: /Day of/ }))
    fireEvent.change(screen.getByLabelText('Move Hocus Pocus to another slot'), {
      target: { value: 'three_weeks_away' },
    })
    expect(onMoveToWindow).toHaveBeenCalledWith('a', 'three_weeks_away')
  })

  it('says Auto calculate while the calendar is empty, and only runs it after confirming', () => {
    const { onAutoCalculate, onClear } = setup()
    fireEvent.click(screen.getByRole('tab', { name: 'Easter' }))
    fireEvent.click(screen.getByRole('button', { name: 'Auto calculate' }))
    expect(onAutoCalculate).not.toHaveBeenCalled()
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Auto calculate' }))
    expect(onAutoCalculate).toHaveBeenCalledWith(3)
    expect(onClear).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('says Clear once the calendar has movies in slots, and clears only after confirming', () => {
    const { onAutoCalculate, onClear } = setup()
    expect(screen.queryByRole('button', { name: 'Auto calculate' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onClear).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toHaveTextContent('No movies are deleted')
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Clear' }))
    expect(onClear).toHaveBeenCalledWith(1)
    expect(onAutoCalculate).not.toHaveBeenCalled()
  })

  it('cancelling the dialog changes nothing', () => {
    const { onClear } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClear).not.toHaveBeenCalled()
  })
})

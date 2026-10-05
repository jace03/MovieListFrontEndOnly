import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MovieForm } from './MovieForm'
import type { Movie } from '../types'

const editingMovie: Movie = {
  id: '1',
  title: 'Beetlejuice',
  year: 1988,
  addedBy: 'Hers',
  rating: 4,
  genre: 'Fantasy',
  decade: '1980s',
  holiday: 'Halloween',
  rank: null,
  watched: true,
  notes: 'Great movie',
  cast: [],
  posterUrl: null,
}

describe('MovieForm', () => {
  it('renders the Add mode heading and hides Cancel when not editing', () => {
    render(<MovieForm editingMovie={null} defaultHoliday="Halloween" onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Add a movie' })).toBeInTheDocument()
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add movie' })).toBeInTheDocument()
  })

  it('renders the Edit mode heading and pre-fills fields from the editing movie', () => {
    render(<MovieForm editingMovie={editingMovie} defaultHoliday="Halloween" onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Edit movie' })).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('Beetlejuice')
    expect(screen.getByLabelText('Year')).toHaveValue(1988)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('does not submit when the title is blank or only whitespace', async () => {
    const onSave = vi.fn()
    render(<MovieForm editingMovie={null} defaultHoliday="Halloween" onSave={onSave} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Title'), '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Add movie' }))
    expect(onSave).not.toHaveBeenCalled()
  })

  it('submits a new movie draft and resets the form in Add mode', async () => {
    const onSave = vi.fn()
    render(<MovieForm editingMovie={null} defaultHoliday="Halloween" onSave={onSave} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Title'), 'Hocus Pocus')
    await userEvent.click(screen.getByRole('button', { name: 'Add movie' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Hocus Pocus' }), null)
    expect(screen.getByLabelText('Title')).toHaveValue('')
  })

  it('submits changes with the movie id and does not reset the form in Edit mode', async () => {
    const onSave = vi.fn()
    render(<MovieForm editingMovie={editingMovie} defaultHoliday="Halloween" onSave={onSave} onCancel={vi.fn()} />)
    await userEvent.clear(screen.getByLabelText('Title'))
    await userEvent.type(screen.getByLabelText('Title'), 'Beetlejuice 2')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Beetlejuice 2' }), '1')
    expect(screen.getByLabelText('Title')).toHaveValue('Beetlejuice 2')
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    render(<MovieForm editingMovie={editingMovie} defaultHoliday="Halloween" onSave={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows "unrated" when rating is 0 and "X/10" otherwise', () => {
    render(<MovieForm editingMovie={{ ...editingMovie, rating: 0 }} defaultHoliday="Halloween" onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Rating (unrated)')).toBeInTheDocument()
  })

  it('switches from edit back to a blank draft when editingMovie becomes null', () => {
    const { rerender } = render(<MovieForm editingMovie={editingMovie} defaultHoliday="Halloween" onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText('Title')).toHaveValue('Beetlejuice')
    rerender(<MovieForm editingMovie={null} defaultHoliday="Halloween" onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText('Title')).toHaveValue('')
  })
})

describe('MovieForm title suggestions', () => {
  it('shows suggestions while typing and fills fields when one is picked', async () => {
    vi.resetModules()
    vi.doMock('../lib/tmdb', () => ({
      searchMovieSuggestions: vi.fn().mockResolvedValue([
        { id: 1, title: 'Hocus Pocus', year: 1993, genre: 'Fantasy', decade: '1990s', posterUrl: 'http://img/p.jpg' },
      ]),
    }))
    const { MovieForm: Form } = await import('./MovieForm')
    render(<Form editingMovie={null} defaultHoliday="Halloween" onSave={vi.fn()} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Title'), 'hoc')
    await userEvent.click(await screen.findByRole('button', { name: /Hocus Pocus/ }))

    expect(screen.getByLabelText('Title')).toHaveValue('Hocus Pocus')
    expect(screen.getByLabelText('Year')).toHaveValue(1993)
    expect(screen.getByLabelText('Genre')).toHaveValue('Fantasy')
    expect(screen.getByLabelText('Decade')).toHaveValue('1990s')
    expect(screen.getByLabelText('Poster image URL')).toHaveValue('http://img/p.jpg')
    vi.doUnmock('../lib/tmdb')
  })
})

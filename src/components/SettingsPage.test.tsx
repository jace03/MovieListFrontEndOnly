import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { HolidayInfo } from '../types'
import { SettingsPage } from './SettingsPage'

const holidays: HolidayInfo[] = [
  { id: 7, name: 'Halloween', emoji: '🎃', day_of_count: 3, week_of_count: 7, two_weeks_away_count: 4, three_weeks_away_count: 4 },
]

describe('SettingsPage', () => {
  it('shows the current slot sizes and saves edits', async () => {
    const onSave = vi.fn().mockResolvedValue(null)
    render(<SettingsPage holidays={holidays} onSave={onSave} />)

    expect(screen.getByLabelText('Week of')).toHaveValue(7)
    fireEvent.change(screen.getByLabelText('Day of'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(screen.getByText('Saved')).toBeInTheDocument())
    expect(onSave).toHaveBeenCalledWith(7, {
      day_of_count: 1,
      week_of_count: 7,
      two_weeks_away_count: 4,
      three_weeks_away_count: 4,
    })
  })

  it('blocks saving an invalid number and shows server errors', async () => {
    const onSave = vi.fn().mockResolvedValue('boom')
    render(<SettingsPage holidays={holidays} onSave={onSave} />)

    fireEvent.change(screen.getByLabelText('Day of'), { target: { value: '' } })
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Day of'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(screen.getByText('boom')).toBeInTheDocument())
  })
})

import { useState } from 'react'
import { UNRANKED } from '../types'

interface RankBadgeProps {
  rank: number
  isRankTaken: (rank: number) => boolean
  onRankChange: (rank: number) => void
}

export function RankBadge({ rank, isRankTaken, onRankChange }: RankBadgeProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')

  const parsed = Number(value)
  const valid = value.trim() !== '' && Number.isInteger(parsed) && parsed >= 1
  const taken = valid && parsed !== rank && parsed < UNRANKED && isRankTaken(parsed)
  const status = !valid ? '' : taken ? 'rank-taken' : 'rank-free'

  function startEditing() {
    setValue(rank >= UNRANKED ? '' : String(rank))
    setEditing(true)
  }

  function commit() {
    if (valid && parsed !== rank) onRankChange(parsed)
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        type="button"
        className="badge badge-rank badge-rank-button"
        aria-label={rank >= UNRANKED ? 'Set rank' : `Rank ${rank}, click to change`}
        onClick={startEditing}
      >
        {rank >= UNRANKED ? '#–' : `#${rank}`}
      </button>
    )
  }

  return (
    <input
      className={`rank-input ${status}`}
      type="number"
      min={1}
      max={UNRANKED}
      autoFocus
      aria-label="New rank"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') setEditing(false)
      }}
    />
  )
}

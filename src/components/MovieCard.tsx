import { useRef } from 'react'
import type { Movie } from '../types'

interface MovieCardProps {
  movie: Movie
  onEdit: (movie: Movie) => void
  onDelete: (id: string) => void
  onToggleWatched: (id: string) => void
  draggable?: boolean
  isDragging?: boolean
  isDropTarget?: boolean
  onDragStart?: (id: string) => void
  onDragEnter?: (id: string) => void
  onDrop?: (id: string) => void
  onDragEnd?: () => void
}

export function MovieCard({
  movie,
  onEdit,
  onDelete,
  onToggleWatched,
  draggable = false,
  isDragging = false,
  isDropTarget = false,
  onDragStart,
  onDragEnter,
  onDrop,
  onDragEnd,
}: MovieCardProps) {
  const handlePressed = useRef(false)

  const dragHandlers = draggable
    ? {
        onDragStart: (event: React.DragEvent<HTMLLIElement>) => {
          if (!handlePressed.current) {
            event.preventDefault()
            return
          }
          onDragStart?.(movie.id)
        },
        onDragEnter: () => onDragEnter?.(movie.id),
        onDragOver: (event: React.DragEvent<HTMLLIElement>) => event.preventDefault(),
        onDrop: (event: React.DragEvent<HTMLLIElement>) => {
          event.preventDefault()
          onDrop?.(movie.id)
        },
        onDragEnd: () => {
          handlePressed.current = false
          onDragEnd?.()
        },
      }
    : {}

  return (
    <li
      className={[
        'movie-card',
        movie.watched && 'watched',
        isDragging && 'dragging',
        isDropTarget && 'drop-target',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable={draggable}
      {...dragHandlers}
    >
      {draggable && (
        <span
          className="drag-handle"
          aria-label="Drag to reorder"
          onMouseDown={() => {
            handlePressed.current = true
          }}
          onMouseUp={() => {
            handlePressed.current = false
          }}
        >
          ⋮⋮
        </span>
      )}

      {movie.posterUrl ? (
        <img
          className="movie-poster"
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          loading="lazy"
        />
      ) : (
        <div className="movie-poster movie-poster-placeholder" aria-hidden="true">
          {movie.holiday === 'Christmas' ? '🎄' : '🎃'}
        </div>
      )}

      <div className="movie-card-body">
        <div className="movie-card-header">
          <div className="title-row">
            {movie.rank !== null && <span className="badge badge-rank">#{movie.rank}</span>}
            <h3>
              {movie.title} {movie.year !== '' && <span className="year">({movie.year})</span>}
            </h3>
          </div>
          <div className="badge-group">
            <span className={`badge badge-${movie.addedBy.toLowerCase()}`}>{movie.addedBy}</span>
          </div>
        </div>

        <div className="tags">
          <span className={`tag tag-${movie.holiday.toLowerCase()}`}>{movie.holiday}</span>
          {movie.genre && <span className="tag">{movie.genre}</span>}
          {movie.decade && <span className="tag">{movie.decade}</span>}
        </div>

        <div className="rating">{movie.rating > 0 ? `⭐ ${movie.rating}/10` : 'Not rated yet'}</div>

        {!!movie.cast?.length && <p className="cast">Cast: {movie.cast.join(', ')}</p>}

        {movie.notes && <p className="notes">{movie.notes}</p>}

        <div className="movie-card-actions">
          <label className="checkbox-label small">
            <input
              type="checkbox"
              checked={movie.watched}
              onChange={() => onToggleWatched(movie.id)}
            />
            Watched
          </label>
          <div className="spacer" />
          <button type="button" className="btn-link" onClick={() => onEdit(movie)}>
            Edit
          </button>
          <button type="button" className="btn-link danger" onClick={() => onDelete(movie.id)}>
            Delete
          </button>
        </div>
      </div>
    </li>
  )
}

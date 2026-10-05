export type Holiday = string

/** Rank 1 is the top of a holiday's list; 100 means unranked and sorts last. */
export const UNRANKED = 100

export interface HolidayInfo {
  id: number
  name: Holiday
  emoji: string
}

export interface Movie {
  id: string
  title: string
  year: number | ''
  addedBy: 'His' | 'Hers' | 'Both'
  rating: number
  genre: string
  decade: string
  holiday: Holiday
  rank: number
  watched: boolean
  notes: string
  cast?: string[]
  posterUrl: string | null
}

export type MovieDraft = Omit<Movie, 'id' | 'cast' | 'posterUrl'> & {
  posterUrl?: string
}

export interface MovieRow {
  id: string
  title: string
  year: number | null
  added_by: Movie['addedBy']
  rating: number
  genre: string | null
  decade: string | null
  holiday: Holiday
  rank: number
  watched: boolean
  notes: string
  created_at: string
  poster_url: string | null
  movie_actor?: { actors: { name: string } | null }[]
}

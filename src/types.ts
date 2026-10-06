export type Holiday = string

/** Rank 1 is the top of a holiday's list; 100 means unranked and sorts last. */
export const UNRANKED = 100

/** When, relative to the holiday, a movie is planned to be watched. */
export type WatchWindow = 'day_of' | 'week_of' | 'two_weeks_away' | 'three_weeks_away' | 'month_away'

export const WATCH_WINDOWS: { value: WatchWindow; label: string }[] = [
  { value: 'day_of', label: 'Day of' },
  { value: 'week_of', label: 'Week of' },
  { value: 'two_weeks_away', label: '2 weeks away' },
  { value: 'three_weeks_away', label: '3 weeks away' },
  { value: 'month_away', label: 'A month away' },
]

export type SlotCountKey = 'day_of_count' | 'week_of_count' | 'two_weeks_away_count' | 'three_weeks_away_count'

export const SLOT_COUNT_FIELDS: { key: SlotCountKey; label: string }[] = [
  { key: 'day_of_count', label: 'Day of' },
  { key: 'week_of_count', label: 'Week of' },
  { key: 'two_weeks_away_count', label: '2 weeks away' },
  { key: 'three_weeks_away_count', label: '3 weeks away' },
]

export interface HolidayInfo {
  id: number
  name: Holiday
  emoji: string
  /** How many movies auto-calculate puts in each slot; the rest go to 'month_away'. */
  day_of_count: number
  week_of_count: number
  two_weeks_away_count: number
  three_weeks_away_count: number
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
  watchWindow: WatchWindow
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
  watch_window: WatchWindow
  watched: boolean
  notes: string
  created_at: string
  poster_url: string | null
  movie_actor?: { actors: { name: string } | null }[]
}

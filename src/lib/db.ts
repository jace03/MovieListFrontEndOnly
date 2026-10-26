import { supabase } from './supabaseClient'
import type { HolidayInfo, MovieRow, SlotCountKey, WatchWindow } from '../types'

export type DbError = { message: string }
export type DbResult<T> = { data: T | null; error: DbError | null }

/** The movie columns the app writes; `holiday` is the holiday's name, mapped to `holiday_id` here. */
export type MovieFields = Omit<MovieRow, 'id' | 'created_at' | 'movie_actor'>
export type MoviePatch = Partial<{ rank: number; watch_window: WatchWindow; watched: boolean }>
export type CalendarAction = 'auto_calculate_calendar' | 'clear_calendar'

const MOVIE_SELECT = '*, holidays(name), movie_actor(actors(name))'
const HOLIDAY_SELECT =
  'id, name, emoji, day_of_count, week_of_count, two_weeks_away_count, three_weeks_away_count'

type MovieRecord = Omit<MovieRow, 'id' | 'holiday'> & {
  id: number
  holiday_id: number | null
  holidays: { name: string } | null
}

function toRow({ holidays, holiday_id: _holidayId, ...record }: MovieRecord): MovieRow {
  return { ...record, id: String(record.id), holiday: holidays?.name ?? '' }
}

type Response<T> = { data: T | null; error: { message: string } | null }

async function run<T, R = T>(query: PromiseLike<Response<T>>, map?: (data: T) => R): Promise<DbResult<R>> {
  try {
    const { data, error } = await query
    if (error) return { data: null, error: { message: error.message } }
    return { data: data === null ? null : map ? map(data) : (data as unknown as R), error: null }
  } catch (err) {
    return { data: null, error: { message: err instanceof Error ? err.message : 'Network error' } }
  }
}

async function toRecord({ holiday, ...fields }: MovieFields): Promise<Omit<MovieFields, 'holiday'> & { holiday_id: number | null }> {
  if (!holiday) return { ...fields, holiday_id: null }
  const { data, error } = await supabase.from('holidays').select('id').eq('name', holiday).single()
  if (error) throw new Error(`Unknown holiday "${holiday}"`)
  return { ...fields, holiday_id: data.id as number }
}

const mapRows = (records: MovieRecord[]) => records.map(toRow)

export const db = {
  fetchMovies: () =>
    run(supabase.from('movies').select(MOVIE_SELECT).order('rank').returns<MovieRecord[]>(), mapRows),

  insertMovie: (fields: MovieFields) =>
    run(
      toRecord(fields).then((record) =>
        supabase.from('movies').insert(record).select(MOVIE_SELECT).single<MovieRecord>(),
      ),
      toRow,
    ),

  updateMovie: (id: string, fields: MovieFields) =>
    run(
      toRecord(fields).then((record) =>
        supabase.from('movies').update(record).eq('id', id).select(MOVIE_SELECT).single<MovieRecord>(),
      ),
      toRow,
    ),

  patchMovie: (id: string, patch: MoviePatch) =>
    run(supabase.from('movies').update(patch).eq('id', id).select(MOVIE_SELECT).single<MovieRecord>(), toRow),

  deleteMovie: (id: string) => run(supabase.from('movies').delete().eq('id', id)),

  /** Both calendar actions return the holiday's movies with their new slots. */
  changeCalendar: (holidayId: number, action: CalendarAction) =>
    run(
      // Without generated DB types supabase-js can't tell this function returns a set of movies.
      supabase.rpc(action, { p_holiday_id: holidayId }).select(MOVIE_SELECT) as unknown as PromiseLike<
        Response<MovieRecord[]>
      >,
      mapRows,
    ),

  fetchHolidays: () =>
    run(supabase.from('holidays').select(HOLIDAY_SELECT).order('sort_order').returns<HolidayInfo[]>()),

  updateHoliday: (id: number, counts: Record<SlotCountKey, number>) =>
    run(supabase.from('holidays').update(counts).eq('id', id).select(HOLIDAY_SELECT).single<HolidayInfo>()),
}

-- MovieList data dump (MySQL 'movieslist' -> Postgres/Supabase)
-- Generated 2026-10-26 21:51
begin;

create table if not exists public.holidays (
  id bigint primary key,
  name text not null,
  emoji text not null default '?',
  sort_order integer not null default 0,
  day_of_count smallint not null default 3,
  week_of_count smallint not null default 7,
  two_weeks_away_count smallint not null default 4,
  three_weeks_away_count smallint not null default 4,
  created_at timestamptz,
  updated_at timestamptz
);
create table if not exists public.actors (
  id bigint primary key,
  name text not null,
  created_at timestamptz,
  updated_at timestamptz
);
create table if not exists public.movies (
  id bigint primary key,
  title text not null,
  year smallint,
  added_by text not null default 'Both' check (added_by in ('His','Hers','Both')),
  genre text,
  decade text,
  holiday_id bigint references public.holidays(id) on delete set null,
  rank integer not null default 100,
  watch_window text not null default 'month_away',
  watched boolean not null default false,
  notes text,
  poster_url text,
  rating integer not null,
  created_at timestamptz,
  updated_at timestamptz
);
create table if not exists public.movie_actor (
  id bigint primary key,
  movie_id bigint not null references public.movies(id) on delete cascade,
  actor_id bigint not null references public.actors(id) on delete cascade,
  created_at timestamptz,
  updated_at timestamptz
);
create index if not exists movie_actor_movie_id_idx on public.movie_actor(movie_id);
create index if not exists movie_actor_actor_id_idx on public.movie_actor(actor_id);

insert into public.holidays ("id", "name", "emoji", "sort_order", "day_of_count", "week_of_count", "two_weeks_away_count", "three_weeks_away_count", "created_at", "updated_at") values ('1', 'Halloween', '🎃', '1', '4', '5', '7', '7', '2026-10-05 09:53:05', '2026-10-07 04:13:51');
insert into public.holidays ("id", "name", "emoji", "sort_order", "day_of_count", "week_of_count", "two_weeks_away_count", "three_weeks_away_count", "created_at", "updated_at") values ('2', 'Christmas', '🎄', '2', '3', '7', '4', '4', '2026-10-05 09:53:05', '2026-10-05 09:53:05');

insert into public.actors ("id", "name", "created_at", "updated_at") values ('1', 'test', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('2', 'Jenna Ortega', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('3', 'Jenna Ortega', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('4', 'Brad Pitt', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('5', 'Tom Cruise', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('6', 'Antonio Banderas', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('10', 'Jim Carrey', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('14', 'Jim Carrey', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('15', 'Jim Carrey', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('16', 'Andy Samberg', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('17', 'Andy Samberg', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('18', 'Paul Rudd', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('19', 'Adam Sandler', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('20', 'Jack Black', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('21', 'Sarah Jessica Parker, Bette Midler, Kathy Najimy', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('22', 'Andy Samberg', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('23', 'Jack Black', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('24', 'Will Ferrell, Nicole Kidman', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('25', 'Olsen Twins', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('26', 'Paul Rudd', NULL, NULL);
insert into public.actors ("id", "name", "created_at", "updated_at") values ('27', 'Andy Samberg', NULL, NULL);

insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('1', 'Hocus Pocus', '1993', 'Both', 'Fantasy', '1990s', '1', '2', 'day_of', '0', 'Day', 'https://image.tmdb.org/t/p/w500/by4D4Q9NlUjFSEUA1yrxq6ksXmk.jpg', '10', '2025-04-11 02:30:17', '2026-10-07 04:21:51');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('2', 'Hocus Pocus 2', '2022', 'Both', 'Fantasy', '2020s', '1', '7', 'day_of', '0', 'Day', 'https://image.tmdb.org/t/p/w500/7ze7YNmUaX81ufctGqt0AgHxRtL.jpg', '0', '2024-10-31 02:30:17', '2026-10-23 20:33:56');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('3', 'Hubie Halloween', '2020', 'Both', 'Comedy', '2020s', '1', '3', 'day_of', '0', 'Day', 'https://image.tmdb.org/t/p/w500/dbhC6qRydXyRmpUdcl9bL9rARya.jpg', '8', '2025-08-13 02:30:17', '2026-10-07 04:21:51');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('5', 'The Office Halloween Episodes', NULL, 'Both', 'Comedy', '2000s', '1', '17', 'month_away', '0', 'Month', NULL, '5', '2025-03-17 02:30:17', '2026-10-24 03:35:54');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('6', 'Brooklyn Nine-Nine Heists', NULL, 'Both', 'Comedy', '2010s', '1', '26', 'month_away', '0', 'Week', NULL, '10', '2025-03-10 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('7', 'Zombieland', '2009', 'Both', 'Horror', '2000s', '1', '18', 'two_weeks_away', '0', 'Month', 'https://image.tmdb.org/t/p/w500/dUkAmAyPVqubSBNRjRqCgHggZcK.jpg', '7', '2025-07-01 02:30:17', '2026-10-12 08:32:16');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('8', 'The Craft', '1996', 'Both', 'Thriller', '1990s', '1', '4', 'week_of', '0', 'Day/Week', 'https://image.tmdb.org/t/p/w500/8bW2RdRkloYtEPhbQZN4wcdmJP4.jpg', '10', '2024-10-12 02:30:17', '2026-10-23 20:33:44');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('9', 'The Craft: Legacy', '2020', 'Both', 'Thriller', '2020s', '1', '9', 'week_of', '0', '2 Weeks Out', 'https://image.tmdb.org/t/p/w500/lhMIra0pqWNuD6CIXoTmGwZ0EBS.jpg', '7', '2025-05-08 02:30:17', '2026-10-24 03:34:56');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('10', 'Beetlejuice', '1988', 'Both', 'Fantasy', '1980s', '1', '12', 'two_weeks_away', '0', 'Month', 'https://image.tmdb.org/t/p/w500/nnl6OWkyPpuMm595hmAxNW3rZFn.jpg', '4', '2025-07-16 02:30:17', '2026-10-07 04:21:51');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('11', 'Beetlejuice Beetlejuice', '2024', 'Both', 'Fantasy', '2020s', '1', '34', 'month_away', '0', 'TBD', 'https://image.tmdb.org/t/p/w500/kKgQzkUCnQmeTPkyIwHly2t6ZFI.jpg', '0', '2025-01-14 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('12', 'Queen of the Damned', '2002', 'Both', 'Horror', '2000s', '1', '6', 'week_of', '0', 'Week', 'https://image.tmdb.org/t/p/w500/4MMpvQYgOz8K6lzlIVMXWjLzUPC.jpg', '9', '2025-01-25 02:30:17', '2026-10-07 04:21:51');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('13', 'Interview with the Vampire', '1994', 'Both', 'Horror', '1990s', '1', '19', 'month_away', '0', 'Month', 'https://image.tmdb.org/t/p/w500/t7NU8IcmcNBrlunCxiycX9JV7Rp.jpg', '3', '2025-08-12 02:30:17', '2026-10-23 20:30:59');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('14', 'Goosebumps', '2015', 'Both', 'Horror', '2010s', '1', '11', 'two_weeks_away', '0', 'TBD', 'https://image.tmdb.org/t/p/w500/aeZT9pqEgrmXOGdESFkAuVjX6kw.jpg', '0', '2025-02-12 02:30:17', '2026-10-07 04:21:51');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('15', 'Goosebumps 2: Haunted Halloween', '2018', 'Both', 'Horror', '2010s', '1', '14', 'month_away', '0', 'Month - TBD rating', 'https://image.tmdb.org/t/p/w500/t2wy38iiMpB8WsgJi3lYeDnGh2H.jpg', '0', '2025-01-24 02:30:17', '2026-10-23 20:31:53');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('16', 'Casper', '1995', 'Both', 'Fantasy', '1990s', '1', '5', 'week_of', '0', 'Week', 'https://image.tmdb.org/t/p/w500/2ah8fNJFZVU3vcXhU5xfAYi2eym.jpg', '10', '2025-03-31 02:30:17', '2026-10-07 04:21:51');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('17', 'Bewitched', '2005', 'Both', 'Rom-Com', '2000s', '1', '27', 'month_away', '0', 'Week - Bri', 'https://image.tmdb.org/t/p/w500/8lx4EXmAZo8ogh4128UBZRQfCjI.jpg', '8', '2024-10-23 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('18', 'Fright Night', '1985', 'Both', 'Horror', '1980s', '1', '37', 'month_away', '0', '2 Months', 'https://image.tmdb.org/t/p/w500/euIh75MwNDrYkTEVSkw7VXWGXoE.jpg', '3', '2025-08-05 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('19', 'Hotel Transylvania', '2012', 'Both', 'Comedy', '2010s', '1', '22', 'three_weeks_away', '0', 'Week of', 'https://image.tmdb.org/t/p/w500/eJGvzGrsfe2sqTUPv5IwLWXjVuR.jpg', '8', '2025-05-05 02:30:17', '2026-10-07 04:21:51');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('20', 'Hotel Transylvania 2', '2015', 'Both', 'Comedy', '2010s', '1', '16', 'month_away', '0', 'Month', 'https://image.tmdb.org/t/p/w500/3nFnrivNgipSKZ8LZJJbRSlAcTR.jpg', '5', '2025-04-15 02:30:17', '2026-10-18 06:54:13');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('21', 'Hotel Transylvania 3', '2018', 'Both', 'Comedy', '2010s', '1', '25', 'month_away', '0', 'Month', 'https://image.tmdb.org/t/p/w500/lzE5BwGQea1nek7TPXUuC5AZ6rq.jpg', '7', '2024-11-30 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('22', 'Double Double Toil and Trouble', '1993', 'Both', 'Fantasy', '1990s', '1', '29', 'month_away', '0', 'TBD - Bri', 'https://image.tmdb.org/t/p/w500/pJZF7RqItBs05TcnRh7ux3sTeAb.jpg', '0', '2025-02-24 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('23', 'Once Bitten', '1985', 'Both', 'Comedy', '1980s', '1', '36', 'month_away', '0', 'TBD', 'https://image.tmdb.org/t/p/w500/eK3dxRrMQGpZ1kLD9wdyOI8urFZ.jpg', '0', '2024-12-25 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('24', 'The Corpse Bride', '2005', 'Both', 'Fantasy', '2000s', '1', '30', 'month_away', '0', 'TBD', 'https://image.tmdb.org/t/p/w500/3RAoVTxUk1OzZClscAsynuu670p.jpg', '0', '2025-04-26 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('25', 'We Have a Ghost', '2023', 'Both', 'Comedy', '2020s', '1', '35', 'month_away', '0', 'TBD', 'https://image.tmdb.org/t/p/w500/xo0fgAUoEeVQ7KsKeMWypyglvnf.jpg', '0', '2024-12-07 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('26', 'The Curse of Bridge Hollow', '2022', 'Both', 'Comedy', '2020s', '1', '8', 'week_of', '0', 'Week', 'https://image.tmdb.org/t/p/w500/t6P9l6tcVnWLS1ADUAfkUCGQhm0.jpg', '8', '2024-10-29 02:30:17', '2026-10-07 04:21:51');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('27', 'Scooby-Doo', '2002', 'Both', 'Mystery', '2000s', '1', '10', 'three_weeks_away', '0', 'TBD', 'https://image.tmdb.org/t/p/w500/mTAiBJGg8mqEfnYHHbi37ZoRSZm.jpg', '0', '2025-02-05 02:30:17', '2026-10-12 08:32:12');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('28', 'Scooby-Doo 2: Monsters Unleashed', '2004', 'Both', 'Mystery', '2000s', '1', '13', 'month_away', '0', 'TBD', 'https://image.tmdb.org/t/p/w500/5BrXCJrs22bR5KR6mLHluYo6y4m.jpg', '0', '2025-02-10 02:30:17', '2026-10-23 20:30:55');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('29', 'Ghostbusters', '1984', 'Both', 'Comedy', '1980s', '1', '20', 'month_away', '0', 'Month', 'https://image.tmdb.org/t/p/w500/7E8nLijS9AwwUEPu2oFYOVKhdFA.jpg', '6', '2025-01-27 02:30:17', '2026-10-23 20:32:56');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('30', 'Ghostbusters II', '1989', 'Both', 'Comedy', '1980s', '1', '23', 'month_away', '0', 'Month', 'https://image.tmdb.org/t/p/w500/iUZPi31KDP0n5ycpycEsvl51BdV.jpg', '5', '2025-03-25 02:30:17', '2026-10-23 20:31:08');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('31', 'Ghostbusters (2016) - Girls', NULL, 'Both', 'Comedy', '2010s', '1', '24', 'three_weeks_away', '0', 'Week', NULL, '9', '2024-09-25 02:30:17', '2026-10-23 20:32:54');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('32', 'Ghostbusters: Afterlife', '2021', 'Both', 'Fantasy', '2020s', '1', '21', 'three_weeks_away', '0', 'Month', 'https://image.tmdb.org/t/p/w500/sg4xJaufDiQl7caFEskBtQXfD4x.jpg', '5', '2025-08-13 02:30:17', '2026-10-07 04:21:51');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('33', 'Ghostbusters: Frozen Empire', '2024', 'Both', 'Fantasy', '2020s', '1', '15', 'two_weeks_away', '0', 'TBD', 'https://image.tmdb.org/t/p/w500/e1J2oNzSBdou01sUvriVuoYp0pJ.jpg', '0', '2025-07-13 02:30:17', '2026-10-07 04:21:51');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('34', 'Wednesday', '2020', 'Both', 'Horror', '2020s', '1', '38', 'month_away', '0', 'Month', 'https://image.tmdb.org/t/p/w500/zLLiKIQmjgKzrOAaLhDa3MNoqJd.jpg', '8', '2025-05-16 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('35', 'The Addams Family', '1991', 'Both', 'Comedy', '1990s', '1', '39', 'month_away', '0', 'Month (Bri priority)', 'https://image.tmdb.org/t/p/w500/qFf8anju5f2epI0my8RdwwIXFIP.jpg', '10', '2025-02-09 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('36', 'The Nightmare Before Christmas', '1993', 'Both', 'Fantasy', '1990s', '1', '33', 'month_away', '0', 'TBD (Bri - Month)', 'https://image.tmdb.org/t/p/w500/oQffRNjK8e19rF7xVYEN8ew0j7b.jpg', '9', '2025-07-05 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('37', 'Coraline', '2009', 'Both', 'Fantasy', '2000s', '1', '32', 'month_away', '0', 'TBD', 'https://image.tmdb.org/t/p/w500/4jeFXQYytChdZYE9JYO7Un87IlW.jpg', '0', '2025-01-08 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('38', 'Frankenweenie', '2012', 'Both', 'Fantasy', '2010s', '1', '31', 'month_away', '0', 'TBD', 'https://image.tmdb.org/t/p/w500/yGjVbLVdZRBlZTTQVBsj2KUjL1s.jpg', '0', '2025-04-09 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('40', 'The Number 23', '2007', 'Both', 'Thriller', '2000s', '1', '28', 'month_away', '0', 'Month', 'https://image.tmdb.org/t/p/w500/iPJwdvgX3I5dEw9QhDOG3hxUvMp.jpg', '2', '2024-10-20 02:30:17', '2026-10-07 04:21:49');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('41', 'The Grinch', '2000', 'Both', 'Comedy', '2000s', '2', '21', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/1WZbbPApEivA421gCOluuzMMKCk.jpg', '0', '2025-02-19 02:30:17', '2025-09-20 05:28:54');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('42', 'Elf', '2003', 'Both', 'Comedy', '2000s', '2', '20', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/oOleziEempUPu96jkGs0Pj6tKxj.jpg', '0', '2025-03-17 02:30:17', '2025-12-17 03:49:50');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('43', 'Four Christmases', '2008', 'Both', 'Rom-Com', '2000s', '2', '19', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/zixj44TC7rwzpxtJAG5OzFJnEqe.jpg', '0', '2025-01-18 02:30:17', '2025-12-17 04:45:28');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('44', 'The Night Before', '2016', 'Both', 'Comedy', '2010s', '2', '18', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/sITpyNP0k8GkW9NVAhCgHJnlJPT.jpg', '0', '2024-11-13 02:30:17', '2024-12-06 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('45', 'Jack Frost', '1998', 'Both', 'Fantasy', '1990s', '2', '17', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/tdSyQJe7vEDcH9kEVqzVcr0O9lS.jpg', '0', '2025-03-11 02:30:17', '2025-03-25 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('46', 'I''ll Be Home for Christmas', '1998', 'Both', 'Comedy', '1990s', '2', '16', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/9hTYFvEDnajUIbpdfc3fO6bZq2Y.jpg', '0', '2025-03-20 02:30:17', '2025-03-23 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('47', 'Home Alone 1', '1990', 'Both', 'Comedy', '1990s', '2', '15', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/onTSipZ8R3bliBdKfPtsDuHTdlL.jpg', '0', '2025-06-06 02:30:17', '2025-07-04 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('48', 'Home Alone 2', '1992', 'Both', 'Comedy', '1990s', '2', '14', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/uuitWHpJwxD1wruFl2nZHIb4UGN.jpg', '0', '2024-11-11 02:30:17', '2024-11-12 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('49', 'Fred Claus', '2007', 'Both', 'Comedy', '2000s', '2', '13', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/9gATbvoRMxVeoHInwS8nR0KZMVc.jpg', '0', '2025-06-25 02:30:17', '2025-06-25 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('50', 'The Santa Clause 1', '1994', 'Both', 'Fantasy', '1990s', '2', '12', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/hvV2rI60qOYELT7tHHLpxtafnBZ.jpg', '0', '2025-06-05 02:30:17', '2025-06-30 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('51', 'The Santa Clause 2', '2002', 'Both', 'Fantasy', '2000s', '2', '11', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/2EAMkz0z1pbr9weOY1Y7buy2AxV.jpg', '0', '2025-01-26 02:30:17', '2025-02-12 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('52', 'Exmas', '2024', 'Both', 'Rom-Com', '2020s', '2', '10', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/ewoUfKevP5A7x4GyJ6nhw3BbjlQ.jpg', '0', '2025-03-15 02:30:17', '2025-03-21 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('53', 'Jack in Time', '2024', 'Both', 'Fantasy', '2020s', '2', '9', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/ezLjq19a1LAWfX5rTMqA2MHEe0.jpg', '0', '2024-12-01 02:30:17', '2024-12-16 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('54', 'Bad Moms 2', '2017', 'Both', 'Comedy', '2010s', '2', '8', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/gPNHolu7AGnrB7r5kvJRRTfwMFR.jpg', '0', '2025-02-21 02:30:17', '2025-03-09 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('55', 'Why Him', '2016', 'Both', 'Comedy', '2010s', '2', '7', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/eezFoKz7bXgdbjeieeCYJFXPKSu.jpg', '0', '2024-12-10 02:30:17', '2024-12-19 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('56', 'The Holiday', '2006', 'Both', 'Rom-Com', '2000s', '2', '6', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/h1ITOpvJN3Tw4Sy60w2QTfYMvdd.jpg', '0', '2025-05-01 02:30:17', '2025-05-25 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('57', 'Love Actually', '2003', 'Both', 'Rom-Com', '2000s', '2', '5', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/7QPeVsr9rcFU9Gl90yg0gTOTpVv.jpg', '0', '2024-12-05 02:30:17', '2025-01-03 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('58', 'Office Christmas Party', '2016', 'Both', 'Comedy', '2010s', '2', '4', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/7r3w3cPTbNEIr1imb8zXyeIJCJe.jpg', '0', '2025-04-10 02:30:17', '2025-04-22 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('59', 'Hot Frosty', '2024', 'Both', 'Fantasy', '2020s', '2', '3', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/waW6R5WJQSxq65gwBkvnKlseU6n.jpg', '0', '2025-04-07 02:30:17', '2025-04-07 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('60', 'Holidate', '2020', 'Both', 'Rom-Com', '2020s', '2', '2', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/oXCLSlCRWWHsSSwLJSVIC0DDWsE.jpg', '0', '2025-02-12 02:30:17', '2025-02-27 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('61', 'Family Switch', '2023', 'Both', 'Comedy', '2020s', '2', '1', 'month_away', '0', '', 'https://image.tmdb.org/t/p/w500/g8Gwitm4CtZBSYhLeSY4Z3Xwwcg.jpg', '0', '2024-10-08 02:30:17', '2024-10-24 02:30:17');
insert into public.movies ("id", "title", "year", "added_by", "genre", "decade", "holiday_id", "rank", "watch_window", "watched", "notes", "poster_url", "rating", "created_at", "updated_at") values ('63', 'Garfield halloween', '1985', 'Both', 'Comedy', '1980s', '1', '1', 'day_of', '0', '', 'https://image.tmdb.org/t/p/w500/akgmKfcusFVNF0NzCIvTWg1wkaS.jpg', '10', '2025-10-22 21:03:50', '2026-10-07 04:21:51');

insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('1', '62', '1', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('2', '34', '2', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('3', '34', '3', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('4', '13', '4', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('5', '13', '5', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('6', '13', '6', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('7', '1', '7', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('8', '1', '8', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('9', '1', '9', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('10', '40', '10', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('11', '1', '11', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('12', '1', '12', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('13', '1', '13', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('14', '40', '14', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('15', '40', '15', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('16', '19', '16', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('17', '20', '17', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('18', '32', '18', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('19', '3', '19', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('20', '14', '20', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('21', '2', '21', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('22', '6', '22', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('23', '15', '23', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('24', '17', '24', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('25', '22', '25', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('26', '33', '26', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('27', '21', '27', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('28', '1', '28', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('29', '1', '29', NULL, NULL);
insert into public.movie_actor ("id", "movie_id", "actor_id", "created_at", "updated_at") values ('30', '1', '30', NULL, NULL);

alter table public.holidays alter column id add generated by default as identity (start with 3);
alter table public.actors alter column id add generated by default as identity (start with 28);
alter table public.movies alter column id add generated by default as identity (start with 64);
alter table public.movie_actor alter column id add generated by default as identity (start with 31);

commit;

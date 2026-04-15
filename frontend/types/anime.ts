export type AnimeTitle = {
  romaji: string;
  english?: string | null;
};

export type AnimeNode = {
  id: number;
  title: AnimeTitle;
  episodes?: number | null;
  average_score?: number | null;
  cover_image?: string | null;
  next_airing_episode?: {
    episode?: number | null;
    airing_at?: number | null;
  } | null;
};

export type AnimeCalendarItem = {
  id: number;
  title: AnimeTitle;
  cover_image?: string | null;
  airing_at?: number | null;
  episode?: number | null;
};

export type AnimeEntry = {
  anime_id: number;
  title: string;
  cover_image?: string | null;
  status: string;
  episodes_watched: number;
  total_episodes?: number | null;
  score?: number | null;
};

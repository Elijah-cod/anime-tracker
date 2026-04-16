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
  score?: number | string | null;
};

export type AnimeEntryCreatePayload = {
  user_id?: number;
  anime_id: number;
  title: string;
  cover_image?: string | null;
  status: string;
  episodes_watched?: number;
  total_episodes?: number | null;
  score?: number | null;
};

export type AnimeEntryUpdatePayload = {
  title?: string;
  cover_image?: string | null;
  status?: string;
  episodes_watched?: number;
  total_episodes?: number | null;
  score?: number | null;
};

export type Review = {
  id: number;
  user_id: number;
  anime_id: number;
  anime_title?: string | null;
  cover_image?: string | null;
  content: string;
  is_spoiler: boolean;
  username?: string | null;
  created_at?: string | null;
};

export type ReviewCreatePayload = {
  user_id?: number;
  anime_id: number;
  anime_title?: string | null;
  cover_image?: string | null;
  content: string;
  is_spoiler?: boolean;
};

export type ImportedEntry = {
  anime_id: number;
  title: string;
  status: string;
  episodes_watched: number;
};

export type ImportResponse = {
  imported_count: number;
  items: ImportedEntry[];
};

export type AnimeEntryStatusCount = {
  status: string;
  count: number;
};

export type LibrarySummary = {
  total_entries: number;
  total_episodes_watched: number;
  average_score?: number | null;
  completed_entries: number;
  watching_entries: number;
  planning_entries: number;
  status_breakdown: AnimeEntryStatusCount[];
  watch_queue: AnimeEntry[];
};

export type User = {
  id: number;
  username: string;
  email: string;
  auth_provider: string;
  created_at?: string | null;
};

export type UserProfileStats = {
  tracked_entries: number;
  reviews_written: number;
  total_episodes_watched: number;
  average_score?: number | null;
  watching_entries: number;
  completed_entries: number;
  account_age_days: number;
};

export type UserActivityItem = {
  kind: string;
  anime_id: number;
  anime_title: string;
  cover_image?: string | null;
  detail: string;
  occurred_at?: string | null;
};

export type UserDashboard = {
  stats: UserProfileStats;
  recent_activity: UserActivityItem[];
};

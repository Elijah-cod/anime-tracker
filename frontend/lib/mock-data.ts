import { AnimeCalendarItem, AnimeEntry, AnimeNode, ImportResponse, Review } from "@/types/anime";

const livePoster = (animeId: number) => `/api/poster/${animeId}`;

export const mockTrending: AnimeNode[] = [
  {
    id: 151807,
    title: { romaji: "Sousou no Frieren", english: "Frieren: Beyond Journey's End" },
    episodes: 28,
    average_score: 91,
    cover_image: livePoster(151807),
    next_airing_episode: null,
  },
  {
    id: 145139,
    title: { romaji: "Dungeon Meshi", english: "Delicious in Dungeon" },
    episodes: 24,
    average_score: 86,
    cover_image: livePoster(145139),
  },
  {
    id: 170942,
    title: { romaji: "Dandadan", english: "DAN DA DAN" },
    episodes: 12,
    average_score: 88,
    cover_image: livePoster(170942),
  },
];

export const mockCalendar: AnimeCalendarItem[] = [
  {
    id: 170942,
    title: { romaji: "Dandadan", english: "DAN DA DAN" },
    cover_image: livePoster(170942),
    airing_at: 1765971600,
    episode: 9,
  },
  {
    id: 1535,
    title: { romaji: "Death Note", english: "Death Note" },
    cover_image: livePoster(1535),
    airing_at: 1765993200,
    episode: 14,
  },
];

export const mockEntries: AnimeEntry[] = [
  {
    anime_id: 16498,
    title: "Attack on Titan",
    cover_image: livePoster(16498),
    status: "WATCHING",
    episodes_watched: 18,
    total_episodes: 25,
    score: 8.8,
  },
  {
    anime_id: 21,
    title: "One Piece",
    cover_image: livePoster(21),
    status: "WATCHING",
    episodes_watched: 1091,
    total_episodes: null,
    score: 9.1,
  },
  {
    anime_id: 1535,
    title: "Death Note",
    cover_image: livePoster(1535),
    status: "COMPLETED",
    episodes_watched: 37,
    total_episodes: 37,
    score: 9.2,
  },
];

export const mockReviews: Review[] = [
  {
    id: 1,
    user_id: 1,
    anime_id: 16498,
    anime_title: "Attack on Titan",
    cover_image: livePoster(16498),
    content: "Still one of the best pacing curves in anime. Every episode lands.",
    is_spoiler: false,
    created_at: "2026-04-16T08:00:00.000Z",
  },
  {
    id: 2,
    user_id: 1,
    anime_id: 1535,
    anime_title: "Death Note",
    cover_image: livePoster(1535),
    content: "A classic cat-and-mouse thriller with a very rewatchable first half.",
    is_spoiler: false,
    created_at: "2026-04-15T16:30:00.000Z",
  },
];

export const mockImportResponse: ImportResponse = {
  imported_count: 3,
  items: [
    {
      anime_id: 16498,
      title: "Attack on Titan",
      status: "WATCHING",
      episodes_watched: 18,
    },
    {
      anime_id: 21,
      title: "One Piece",
      status: "WATCHING",
      episodes_watched: 1091,
    },
    {
      anime_id: 1535,
      title: "Death Note",
      status: "COMPLETED",
      episodes_watched: 37,
    },
  ],
};

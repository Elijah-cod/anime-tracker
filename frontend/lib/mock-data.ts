import { AnimeCalendarItem, AnimeEntry, AnimeNode } from "@/types/anime";

export const mockTrending: AnimeNode[] = [
  {
    id: 151807,
    title: { romaji: "Sousou no Frieren", english: "Frieren: Beyond Journey's End" },
    episodes: 28,
    average_score: 91,
    cover_image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-b4pv8nqQgx8c.jpg",
    next_airing_episode: null,
  },
  {
    id: 145139,
    title: { romaji: "Dungeon Meshi", english: "Delicious in Dungeon" },
    episodes: 24,
    average_score: 86,
    cover_image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx153518-8Z1P2ahA4uyl.jpg",
  },
  {
    id: 170942,
    title: { romaji: "Dandadan", english: "DAN DA DAN" },
    episodes: 12,
    average_score: 88,
    cover_image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-w2Nf8V7xGRY4.jpg",
  },
];

export const mockCalendar: AnimeCalendarItem[] = [
  {
    id: 170942,
    title: { romaji: "Dandadan", english: "DAN DA DAN" },
    cover_image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-w2Nf8V7xGRY4.jpg",
    airing_at: 1765971600,
    episode: 9,
  },
  {
    id: 1535,
    title: { romaji: "Death Note", english: "Death Note" },
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535.jpg",
    airing_at: 1765993200,
    episode: 14,
  },
];

export const mockEntries: AnimeEntry[] = [
  {
    anime_id: 16498,
    title: "Attack on Titan",
    cover_image:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-8gQ5ooL0Y2dc.jpg",
    status: "WATCHING",
    episodes_watched: 18,
    total_episodes: 25,
    score: 8.8,
  },
  {
    anime_id: 21,
    title: "One Piece",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkAxFn.jpg",
    status: "WATCHING",
    episodes_watched: 1091,
    total_episodes: null,
    score: 9.1,
  },
  {
    anime_id: 1535,
    title: "Death Note",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535.jpg",
    status: "COMPLETED",
    episodes_watched: 37,
    total_episodes: 37,
    score: 9.2,
  },
];

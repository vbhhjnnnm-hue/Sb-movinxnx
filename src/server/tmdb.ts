/**
 * Server-Side TMDB Service
 *
 * CRITICAL SECURITY:
 * The TMDB API key is stored strictly on the server and is never exposed
 * to client-side code, React components, or public HTML.
 */

import { TMDBMovieResult } from '../types/index.ts';

// Curated baseline TMDB catalogue with authentic TMDB IDs and poster paths.
// This allows full testing and instant search even before the operator
// enters their custom TMDB API key in .env or Admin Settings.
const CURATED_TMDB_CATALOG: TMDBMovieResult[] = [
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    release_date: '2014-11-05',
    vote_average: 8.4,
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/rAiYTsqJJR0KP8UN8vJjZ9rUOXE.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rAiYTsqJJR0KP8UN8vJjZ9rUOXE.jpg',
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
    release_date: '2010-07-15',
    vote_average: 8.8,
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.',
    release_date: '2008-07-16',
    vote_average: 9.0,
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
  },
  {
    id: 438631,
    title: 'Dune',
    overview: 'A noble family becomes embroiled in a war for control over the galaxy\'s most valuable asset.',
    release_date: '2021-09-15',
    vote_average: 8.1,
    poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    backdrop_path: '/lzWHmYZrBtPTMpPT8g2gEG03vWs.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/lzWHmYZrBtPTMpPT8g2gEG03vWs.jpg',
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    release_date: '2024-02-27',
    vote_average: 8.3,
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5200bm.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5200bm.jpg',
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
    release_date: '2023-07-19',
    vote_average: 8.1,
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
  },
  {
    id: 335984,
    title: 'Blade Runner 2049',
    overview: 'A young blade runner discovers a long-buried secret that leads him to track down former blade runner Rick Deckard.',
    release_date: '2017-10-04',
    vote_average: 8.0,
    poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdrop_path: '/ilRyASDvt7vcr9QJv04e4gKk76h.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/ilRyASDvt7vcr9QJv04e4gKk76h.jpg',
  },
  {
    id: 414906,
    title: 'The Batman',
    overview: 'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family.',
    release_date: '2022-03-01',
    vote_average: 7.7,
    poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdrop_path: '/5P8SmMzSNYikXpxil6BYz9G660E.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/5P8SmMzSNYikXpxil6BYz9G660E.jpg',
  },
  {
    id: 603,
    title: 'The Matrix',
    overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast computers who now rule the earth.',
    release_date: '1999-03-30',
    vote_average: 8.2,
    poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdrop_path: '/tlm0vU8eLw26G3Yq6QWk9Q7uBsf.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tlm0vU8eLw26G3Yq6QWk9Q7uBsf.jpg',
  },
  {
    id: 597,
    title: 'Titanic',
    overview: '101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic, 84 years later.',
    release_date: '1997-11-18',
    vote_average: 7.9,
    poster_path: '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
    backdrop_path: '/6VmF2cGsn724g099i9j4t65yq19.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/6VmF2cGsn724g099i9j4t65yq19.jpg',
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    overview: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in four tales of violence and redemption.',
    release_date: '1994-09-10',
    vote_average: 8.5,
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
  },
  {
    id: 98,
    title: 'Gladiator',
    overview: 'In the year 180, the death of emperor Marcus Aurelius throws the Roman Empire into turmoil.',
    release_date: '2000-05-01',
    vote_average: 8.2,
    poster_path: '/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
    backdrop_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
  },
  {
    id: 550,
    title: 'Fight Club',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    release_date: '1999-10-15',
    vote_average: 8.4,
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
  },
  {
    id: 19995,
    title: 'Avatar',
    overview: 'In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization.',
    release_date: '2009-12-15',
    vote_average: 7.6,
    poster_path: '/kyeqWdyUXW608qlYkRqosgbbnKR.jpg',
    backdrop_path: '/o07ALFG5Tfpd7qGKvnBoQ5bvgPt.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbnKR.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/o07ALFG5Tfpd7qGKvnBoQ5bvgPt.jpg',
  },
  {
    id: 76600,
    title: 'Avatar: The Way of Water',
    overview: 'Set more than a decade after the events of the first film, learn the story of the Sully family and the trouble that follows them.',
    release_date: '2022-12-14',
    vote_average: 7.7,
    poster_path: '/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdrop_path: '/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
  },
];

const DEFAULT_POSTER_PLACEHOLDER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';

export async function searchTMDB(query: string): Promise<TMDBMovieResult[]> {
  const sanitizedQuery = (query || '').trim();
  if (!sanitizedQuery) {
    return [];
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (apiKey && apiKey.trim().length > 5) {
    try {
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${encodeURIComponent(
        apiKey.trim()
      )}&query=${encodeURIComponent(sanitizedQuery)}&include_adult=false&language=en-US&page=1`;

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`TMDB HTTP error ${response.status}`);
      }

      const data = (await response.json()) as { results?: any[] };
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.slice(0, 20).map((item) => {
        const posterUrl = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : DEFAULT_POSTER_PLACEHOLDER;

        const backdropUrl = item.backdrop_path
          ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
          : undefined;

        return {
          id: item.id,
          tmdbId: item.id,
          title: item.title || 'Untitled Movie',
          overview: item.overview || '',
          release_date: item.release_date || '',
          releaseDate: item.release_date || '',
          vote_average: typeof item.vote_average === 'number' ? item.vote_average : 0,
          rating: typeof item.vote_average === 'number' ? Number(item.vote_average.toFixed(1)) : 8.0,
          genre: 'Cinema',
          poster_path: item.poster_path || null,
          backdrop_path: item.backdrop_path || null,
          posterUrl,
          backdropUrl,
        };
      });
    } catch (error) {
      console.warn('TMDB API request failed, falling back to curated library:', error);
      // Fall through to fallback
    }
  }

  // Fallback to local catalog when TMDB_API_KEY is not configured or fails
  const lower = sanitizedQuery.toLowerCase();
  const matched = CURATED_TMDB_CATALOG.filter(
    (m) =>
      m.title.toLowerCase().includes(lower) ||
      (m.overview && m.overview.toLowerCase().includes(lower))
  );

  const rawList = matched.length > 0 ? matched : CURATED_TMDB_CATALOG.slice(0, 6);
  return rawList.map((m) => ({
    ...m,
    tmdbId: m.id,
    releaseDate: m.release_date,
    rating: m.vote_average,
    genre: 'Cinema',
  }));
}

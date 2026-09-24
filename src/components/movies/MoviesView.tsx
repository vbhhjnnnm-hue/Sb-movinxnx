/**
 * Movies Catalog View - Full Filterable Grid
 */

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Film, Star } from 'lucide-react';
import { Movie } from '../../types/index.ts';
import { MovieCard } from './MovieCard.tsx';
import { AdSenseBanner } from '../ads/AdSenseBanner.tsx';
import { AdSettings } from '../../types/index.ts';

interface MoviesViewProps {
  movies: Movie[];
  watchlistIds: string[];
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  adSettings?: AdSettings | null;
}

export const MoviesView: React.FC<MoviesViewProps> = ({
  movies,
  watchlistIds,
  onSelectMovie,
  onPlayMovie,
  onToggleWatchlist,
  adSettings,
}) => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'title'>('latest');

  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => {
      if (m.genre) set.add(m.genre);
    });
    return ['All', ...Array.from(set).sort()];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    let list = [...movies];

    if (selectedGenre !== 'All') {
      list = list.filter(
        (m) => m.genre && m.genre.toLowerCase() === selectedGenre.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.overview && m.overview.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [movies, selectedGenre, search, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-white tracking-wide">
            Movies Catalog
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Browse cinematic releases, filter by genre, and discover critically acclaimed titles
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movie titles..."
              className="w-full sm:w-64 bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="latest">Recently Added</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenre === g
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* In-Feed Movie Listing Ad Placement */}
      {adSettings?.enabled && adSettings.movieListingSlot && (
        <AdSenseBanner
          placement="movieListing"
          enabled={adSettings.enabled}
          publisherId={adSettings.publisherId}
          slotId={adSettings.movieListingSlot}
        />
      )}

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">
          <Film className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
          <h3 className="text-base font-bold text-zinc-300">No movies found</h3>
          <p className="text-xs text-zinc-500 mt-1">Try resetting your filters or search keywords</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
              onPlay={onPlayMovie}
              inWatchlist={watchlistIds.includes(movie.id)}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

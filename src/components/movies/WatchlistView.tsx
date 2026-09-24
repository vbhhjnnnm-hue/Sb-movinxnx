/**
 * User Watchlist / My List View
 */

import React from 'react';
import { Bookmark, Film, Play, Trash2, Plus } from 'lucide-react';
import { Movie, WatchlistItem } from '../../types/index.ts';
import { MovieCard } from './MovieCard.tsx';

interface WatchlistViewProps {
  watchlist: WatchlistItem[];
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  onRemoveFromWatchlist: (movieId: string) => void;
  onExploreMovies: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  onSelectMovie,
  onPlayMovie,
  onRemoveFromWatchlist,
  onExploreMovies,
}) => {
  const validMovies = watchlist
    .map((item) => item.movie)
    .filter((m): m is Movie => Boolean(m));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-zinc-800/80 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-white tracking-wide flex items-center space-x-3">
            <Bookmark className="h-7 w-7 text-amber-400" />
            <span>My Watchlist</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Personal bookmark queue of films you want to experience
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
          {validMovies.length} Saved {validMovies.length === 1 ? 'Title' : 'Titles'}
        </span>
      </div>

      {validMovies.length === 0 ? (
        <div className="py-24 text-center rounded-2xl bg-zinc-950/60 border border-zinc-900 p-8 space-y-4 max-w-md mx-auto">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600">
            <Bookmark className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-200">Your watchlist is empty</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Explore the premiere catalog and click "+ Add to My List" to bookmark films for later.
            </p>
          </div>
          <button
            onClick={onExploreMovies}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/15"
          >
            <Film className="h-4 w-4" />
            <span>Explore Movies Catalog</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {validMovies.map((movie) => (
            <div key={movie.id} className="relative group">
              <MovieCard
                movie={movie}
                onSelect={onSelectMovie}
                onPlay={onPlayMovie}
                inWatchlist={true}
                onToggleWatchlist={() => onRemoveFromWatchlist(movie.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

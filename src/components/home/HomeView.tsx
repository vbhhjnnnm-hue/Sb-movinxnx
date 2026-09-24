/**
 * Obsidian Cinema - Dark Cinematic Homepage View
 */

import React from 'react';
import { Sparkles, TrendingUp, Clock, Compass, ChevronRight, Play } from 'lucide-react';
import { Movie, WatchHistoryItem, AdSettings } from '../../types/index.ts';
import { HeroMovie } from '../movies/HeroMovie.tsx';
import { MovieCard } from '../movies/MovieCard.tsx';
import { AdSenseBanner } from '../ads/AdSenseBanner.tsx';

interface HomeViewProps {
  featuredMovie?: Movie;
  movies: Movie[];
  continueWatching: WatchHistoryItem[];
  watchlistIds: string[];
  onSelectMovie: (movie: Movie) => void;
  onPlayMovie: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  onViewAllMovies: () => void;
  adSettings?: AdSettings | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  featuredMovie,
  movies,
  continueWatching,
  watchlistIds,
  onSelectMovie,
  onPlayMovie,
  onToggleWatchlist,
  onViewAllMovies,
  adSettings,
}) => {
  // Categorize movies for homepage rows
  const latestMovies = movies.slice(0, 5);
  const popularMovies = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
  const sciFiMovies = movies.filter((m) => m.genre?.toLowerCase() === 'sci-fi').slice(0, 5);
  const actionMovies = movies.filter((m) => m.genre?.toLowerCase() === 'action').slice(0, 5);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Movie Section */}
      <HeroMovie
        movie={featuredMovie || movies[0]}
        onPlay={onPlayMovie}
        onOpenDetails={onSelectMovie}
        inWatchlist={featuredMovie ? watchlistIds.includes(featuredMovie.id) : false}
        onToggleWatchlist={onToggleWatchlist}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2. Continue Watching Row (Active user sessions) */}
        {continueWatching.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-bold font-serif text-white tracking-wide">
                Continue Watching
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {continueWatching.slice(0, 3).map((item) => {
                const m = item.movie;
                if (!m) return null;
                return (
                  <div
                    key={item.id}
                    onClick={() => onPlayMovie(m)}
                    className="group relative flex items-center space-x-3.5 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 cursor-pointer transition-all shadow-lg"
                  >
                    <div className="relative h-20 w-14 rounded-xl overflow-hidden bg-zinc-950 shrink-0">
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-5 w-5 text-amber-400 fill-current" />
                      </div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                        {m.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {item.percentage || 25}% completed
                      </p>
                      {/* Progress line */}
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${item.percentage || 25}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Latest Releases Row */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-bold font-serif text-white tracking-wide">
                Latest Additions
              </h2>
            </div>
            <button
              onClick={onViewAllMovies}
              className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              <span>Explore All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {latestMovies.map((movie) => (
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
        </section>

        {/* 4. Policy-Compliant Google AdSense Placement (Homepage Leaderboard) */}
        {adSettings?.enabled && adSettings.homepageSlot && (
          <AdSenseBanner
            placement="homepage"
            enabled={adSettings.enabled}
            publisherId={adSettings.publisherId}
            slotId={adSettings.homepageSlot}
          />
        )}

        {/* 5. Popular Movies Row */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-bold font-serif text-white tracking-wide">
                Top Rated Cinema
              </h2>
            </div>
            <button
              onClick={onViewAllMovies}
              className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              <span>View Ranked</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {popularMovies.map((movie) => (
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
        </section>

        {/* 6. Sci-Fi & Speculative Fiction Row */}
        {sciFiMovies.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Compass className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-bold font-serif text-white tracking-wide">
                Sci-Fi & Cosmic Horizons
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {sciFiMovies.map((movie) => (
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
          </section>
        )}

        {/* 7. High-Stakes Action & Thrillers */}
        {actionMovies.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-bold font-serif text-white tracking-wide">
                Action & Gripping Thrillers
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {actionMovies.map((movie) => (
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
          </section>
        )}
      </div>
    </div>
  );
};

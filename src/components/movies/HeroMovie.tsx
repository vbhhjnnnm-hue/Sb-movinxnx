/**
 * Hero Movie Section Component
 * Dramatic wide cinematic header showcasing the featured title
 */

import React from 'react';
import { Play, Plus, Check, Info, Star, Calendar, Sparkles } from 'lucide-react';
import { Movie } from '../../types/index.ts';

interface HeroMovieProps {
  movie?: Movie;
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  inWatchlist?: boolean;
  onToggleWatchlist?: (movie: Movie) => void;
}

export const HeroMovie: React.FC<HeroMovieProps> = ({
  movie,
  onPlay,
  onOpenDetails,
  inWatchlist = false,
  onToggleWatchlist,
}) => {
  if (!movie) {
    return (
      <div className="relative w-full h-[65vh] min-h-[480px] bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-600 flex items-center space-x-2">
          <Sparkles className="h-5 w-5" />
          <span>Curating Premiere Spotlight...</span>
        </div>
      </div>
    );
  }

  const backdrop =
    movie.backdropUrl ||
    movie.posterUrl ||
    'https://image.tmdb.org/t/p/original/rAiYTsqJJR0KP8UN8vJjZ9rUOXE.jpg';
  const releaseYear = movie.releaseDate ? movie.releaseDate.split('-')[0] : '2024';

  return (
    <div className="relative w-full h-[70vh] min-h-[520px] max-h-[720px] overflow-hidden bg-black select-none">
      {/* Background Image with Parallax Style Vignette */}
      <img
        src={backdrop}
        alt={movie.title}
        className="absolute inset-0 h-full w-full object-cover object-center filter brightness-[0.75] contrast-[1.08] transition-transform duration-1000 scale-100 hover:scale-105"
      />

      {/* Cinematic Gradient Overlays: Obsidian Dark Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#08090d] to-transparent" />

      {/* Content Container */}
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Spotlight Badge & Meta */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-400 uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Premiere Showcase</span>
            </span>

            {movie.genre && (
              <span className="rounded-md bg-zinc-900/80 border border-zinc-700/60 px-2.5 py-0.5 text-xs font-medium text-zinc-300 backdrop-blur-md">
                {movie.genre}
              </span>
            )}

            {movie.rating && (
              <span className="flex items-center space-x-1 rounded-md bg-black/70 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-400 backdrop-blur-md">
                <Star className="h-3 w-3 fill-amber-400" />
                <span>{movie.rating.toFixed(1)}</span>
              </span>
            )}

            <span className="flex items-center space-x-1 text-xs text-zinc-400 font-medium">
              <Calendar className="h-3 w-3" />
              <span>{releaseYear}</span>
            </span>

            {movie.duration && (
              <span className="text-xs text-zinc-400">&bull; {movie.duration}</span>
            )}
          </div>

          {/* Title in original bold cinematic typography */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md leading-[1.1]">
            {movie.title}
          </h1>

          {/* Synopsis */}
          <p className="line-clamp-3 text-sm sm:text-base text-zinc-300 font-normal leading-relaxed drop-shadow">
            {movie.overview}
          </p>

          {/* Action Triggers */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onPlay(movie)}
              className="flex items-center space-x-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-black shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 hover:scale-[1.02] active:scale-95 transition-all focus:outline-none"
            >
              <Play className="h-4 w-4 fill-current ml-0.5" />
              <span>Watch Now</span>
            </button>

            {onToggleWatchlist && (
              <button
                onClick={() => onToggleWatchlist(movie)}
                className={`flex items-center space-x-2 rounded-xl border backdrop-blur-md px-5 py-3 text-sm font-semibold transition-all focus:outline-none ${
                  inWatchlist
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-zinc-900/80 border-zinc-700/80 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800'
                }`}
              >
                {inWatchlist ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>In My List</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Add to My List</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => onOpenDetails(movie)}
              className="flex items-center space-x-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all focus:outline-none"
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

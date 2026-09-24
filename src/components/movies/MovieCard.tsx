/**
 * MovieCard Component
 * Displays TMDB poster, title, rating, and interactive action triggers
 */

import React, { useState } from 'react';
import { Play, Plus, Check, Star, Clock } from 'lucide-react';
import { Movie } from '../../types/index.ts';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onPlay: (movie: Movie) => void;
  inWatchlist?: boolean;
  onToggleWatchlist?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelect,
  onPlay,
  inWatchlist = false,
  onToggleWatchlist,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const releaseYear = movie.releaseDate ? movie.releaseDate.split('-')[0] : '';
  const fallbackPoster =
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';

  return (
    <div className="group relative flex flex-col rounded-2xl bg-zinc-900/60 border border-zinc-800/60 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-500/40 transition-all duration-300 transform hover:-translate-y-1">
      {/* Poster Image Container with 2:3 aspect ratio */}
      <div
        onClick={() => onSelect(movie)}
        className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950 cursor-pointer"
      >
        {/* Loading skeleton placeholder */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-zinc-800 to-zinc-900" />
        )}

        <img
          src={imgError ? fallbackPoster : movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Ambient Gradient Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5">
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(movie);
              }}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-500 text-black shadow-lg shadow-amber-500/30 hover:scale-110 hover:bg-amber-400 transition-all focus:outline-none"
              title="Watch Trailer / Film"
            >
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </button>

            {onToggleWatchlist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatchlist(movie);
                }}
                className={`flex items-center justify-center h-10 w-10 rounded-full border backdrop-blur-md transition-all focus:outline-none ${
                  inWatchlist
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                    : 'bg-zinc-900/80 border-zinc-700 text-zinc-200 hover:border-amber-400 hover:text-amber-400'
                }`}
                title={inWatchlist ? 'Remove from My List' : 'Add to My List'}
              >
                {inWatchlist ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Genre Pill Badge */}
        {movie.genre && (
          <div className="absolute top-2.5 left-2.5 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-zinc-300 border border-white/10 uppercase tracking-wider">
            {movie.genre}
          </div>
        )}

        {/* Rating Badge */}
        {typeof movie.rating === 'number' && movie.rating > 0 && (
          <div className="absolute top-2.5 right-2.5 flex items-center space-x-1 rounded-md bg-black/80 backdrop-blur-md px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/30">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Card Info Section */}
      <div className="p-3.5 flex flex-col justify-between flex-grow">
        <div>
          <h3
            onClick={() => onSelect(movie)}
            className="font-medium text-sm text-zinc-100 hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
            title={movie.title}
          >
            {movie.title}
          </h3>

          <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mt-1">
            {releaseYear && <span>{releaseYear}</span>}
            {releaseYear && movie.duration && <span>&bull;</span>}
            {movie.duration && (
              <span className="flex items-center space-x-0.5">
                <Clock className="h-2.5 w-2.5 text-zinc-500" />
                <span>{movie.duration}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

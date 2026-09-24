/**
 * Fast Movie Search Overlay Component
 * Supports partial title, case-insensitive, instantaneous response
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Film, Star, Clock } from 'lucide-react';
import { Movie } from '../../types/index.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  movies,
  onSelectMovie,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? movies.filter(
        (m) =>
          m.title.toLowerCase().includes(trimmed) ||
          (m.genre && m.genre.toLowerCase().includes(trimmed)) ||
          (m.overview && m.overview.toLowerCase().includes(trimmed))
      )
    : movies.slice(0, 8);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-[#0c0d14] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-900/40">
          <SearchIcon className="h-5 w-5 text-amber-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, genre, or keyword (e.g. Batman, Nolan, Sci-Fi)..."
            className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-zinc-400 hover:text-white mr-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-800/80 px-2 py-1 text-xs text-zinc-400 hover:text-white border border-zinc-700/50"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-2">
          <div className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase px-2 mb-2">
            {trimmed ? `Search Results (${filtered.length})` : 'Popular Titles in Library'}
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <Film className="h-10 w-10 mx-auto text-zinc-700 mb-2" />
              <p className="text-sm font-medium text-zinc-400">No movies match your search</p>
              <p className="text-xs text-zinc-600 mt-1">Try searching for "Dune", "Batman", or "Action"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => {
                    onSelectMovie(movie);
                    onClose();
                  }}
                  className="flex items-center space-x-3 p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 hover:border-amber-500/40 cursor-pointer transition-all group"
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-16 w-12 rounded-lg object-cover bg-zinc-950 shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors truncate">
                      {movie.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mt-1">
                      {movie.genre && (
                        <span className="text-zinc-300 font-medium">{movie.genre}</span>
                      )}
                      {movie.releaseDate && (
                        <span>&bull; {movie.releaseDate.split('-')[0]}</span>
                      )}
                      {movie.rating && (
                        <span className="flex items-center space-x-0.5 text-amber-400 font-bold ml-auto">
                          <Star className="h-3 w-3 fill-amber-400" />
                          <span>{movie.rating.toFixed(1)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

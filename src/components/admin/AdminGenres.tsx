/**
 * Admin Panel - Genre & Category Management
 */

import React, { useState, useEffect } from 'react';
import { Tags, Film, Plus, Check } from 'lucide-react';
import { Movie } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

export const AdminGenres: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [customGenres, setCustomGenres] = useState<string[]>([
    'Action',
    'Sci-Fi',
    'Drama',
    'Crime',
    'Thriller',
    'Animation',
    'Adventure',
    'Horror',
    'Mystery',
  ]);
  const [newGenreName, setNewGenreName] = useState('');

  useEffect(() => {
    api.admin.getMovies().then((res) => setMovies(res.movies)).catch(() => {});
  }, []);

  const handleAddGenre = (e: React.FormEvent) => {
    e.preventDefault();
    const g = newGenreName.trim();
    if (!g) return;
    if (customGenres.some((x) => x.toLowerCase() === g.toLowerCase())) {
      alert('This genre already exists.');
      return;
    }
    setCustomGenres([...customGenres, g]);
    setNewGenreName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
          Genres & Categories
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Catalog taxonomy, genre mapping, and content category distribution
        </p>
      </div>

      {/* Add Genre Form */}
      <div className="p-5 rounded-2xl bg-[#0d0f17] border border-zinc-800/80">
        <form onSubmit={handleAddGenre} className="flex gap-3 max-w-md">
          <input
            type="text"
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            placeholder="Add new genre taxonomy (e.g. Cyberpunk)..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors"
          >
            Add Genre
          </button>
        </form>
      </div>

      {/* Genre Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {customGenres.map((genre) => {
          const count = movies.filter(
            (m) => m.genre && m.genre.toLowerCase() === genre.toLowerCase()
          ).length;
          return (
            <div
              key={genre}
              className="p-5 rounded-2xl bg-[#0d0f17] border border-zinc-800/80 flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Tags className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">{genre}</h4>
                  <p className="text-xs text-zinc-400">{count} titles mapped</p>
                </div>
              </div>

              <span className="text-xs font-mono px-2 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                ACTIVE
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

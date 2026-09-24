/**
 * Admin Movies Management & TMDB One-Click Ingestion System
 */

import React, { useState, useEffect } from 'react';
import {
  Film,
  Plus,
  Search,
  Check,
  X,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Star,
  Calendar,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { Movie, TMDBMovieResult } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

interface AdminMoviesProps {
  onOpenPlayerPreview?: (movie: Movie) => void;
}

export const AdminMovies: React.FC<AdminMoviesProps> = ({ onOpenPlayerPreview }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Add Movie Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<TMDBMovieResult[]>([]);
  const [searchingTmdb, setSearchingTmdb] = useState(false);
  const [selectedTmdbMovie, setSelectedTmdbMovie] = useState<TMDBMovieResult | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [addingToDb, setAddingToDb] = useState(false);

  // Edit Movie Modal State
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editRating, setEditRating] = useState(8.0);
  const [editDuration, setEditDuration] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getMovies({
        search: searchTerm,
        genre: filterGenre,
      });
      setMovies(data.movies);
    } catch (e) {
      console.error('Failed to load movies', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [searchTerm, filterGenre]);

  // TMDB Live Search
  const handleTmdbSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tmdbSearchQuery.trim()) return;

    setSearchingTmdb(true);
    setAddError(null);
    try {
      const data = await api.admin.searchTMDB(tmdbSearchQuery);
      setTmdbResults(data.results);
    } catch (err: any) {
      setAddError(err.message || 'Error communicating with TMDB search.');
    } finally {
      setSearchingTmdb(false);
    }
  };

  // Add Movie to DB
  const handleConfirmAddMovie = async () => {
    if (!selectedTmdbMovie) return;
    setAddingToDb(true);
    setAddError(null);
    setAddSuccess(null);

    try {
      const targetTmdbId = selectedTmdbMovie.tmdbId || selectedTmdbMovie.id;
      const res = await api.admin.addMovie({
        tmdbId: targetTmdbId,
        title: selectedTmdbMovie.title,
        posterUrl: selectedTmdbMovie.posterUrl,
        backdropUrl: selectedTmdbMovie.backdropUrl,
        overview: selectedTmdbMovie.overview,
        releaseDate: selectedTmdbMovie.releaseDate || selectedTmdbMovie.release_date,
        genre: selectedTmdbMovie.genre || 'Cinema',
        rating: selectedTmdbMovie.rating || 8.0,
        published: true,
      });

      setAddSuccess(`"${res.movie.title}" successfully added to the catalog!`);
      fetchMovies();
      setTimeout(() => {
        setIsAddModalOpen(false);
        setSelectedTmdbMovie(null);
        setTmdbSearchQuery('');
        setTmdbResults([]);
        setAddSuccess(null);
      }, 1200);
    } catch (err: any) {
      // DUPLICATE PROTECTION MESSAGE: "This movie has already been added."
      setAddError(err.message || 'Failed to add movie to catalog.');
    } finally {
      setAddingToDb(false);
    }
  };

  // Toggle Publish / Unpublish
  const handleTogglePublish = async (movie: Movie) => {
    try {
      await api.admin.togglePublish(movie.id);
      fetchMovies();
    } catch (err: any) {
      alert(err.message || 'Failed to update publication status.');
    }
  };

  // Delete Movie
  const handleDeleteMovie = async (movie: Movie) => {
    if (window.confirm(`Delete "${movie.title}" from catalog permanently?`)) {
      try {
        await api.admin.deleteMovie(movie.id);
        fetchMovies();
      } catch (err: any) {
        alert(err.message || 'Delete operation failed.');
      }
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected movies permanently?`)) {
      try {
        await api.admin.bulkDeleteMovies(selectedIds);
        setSelectedIds([]);
        fetchMovies();
      } catch (err: any) {
        alert(err.message || 'Bulk delete failed.');
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === movies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(movies.map((m) => m.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Edit Handlers
  const openEditModal = (m: Movie) => {
    setEditingMovie(m);
    setEditTitle(m.title);
    setEditGenre(m.genre || 'Action');
    setEditRating(m.rating || 8.0);
    setEditDuration(m.duration || '120 min');
    setEditVideoUrl(m.videoUrl || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;
    setSavingEdit(true);

    try {
      await api.admin.updateMovie(editingMovie.id, {
        title: editTitle,
        genre: editGenre,
        rating: Number(editRating),
        duration: editDuration,
        videoUrl: editVideoUrl,
      });
      setEditingMovie(null);
      fetchMovies();
    } catch (err: any) {
      alert(err.message || 'Update failed.');
    } finally {
      setSavingEdit(false);
    }
  };

  const genres = React.useMemo(() => {
    const set = new Set<string>(['Action', 'Adventure', 'Sci-Fi', 'Drama', 'Crime', 'Thriller', 'Animation', 'Comedy']);
    movies.forEach((m) => {
      if (m.genre) set.add(m.genre);
    });
    return ['All', ...Array.from(set).sort()];
  }, [movies]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
            Movie Catalog Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Search TMDB, import titles in one click, and manage distribution status
          </p>
        </div>

        <button
          onClick={() => {
            setIsAddModalOpen(true);
            setAddError(null);
            setAddSuccess(null);
            setSelectedTmdbMovie(null);
            if (tmdbResults.length === 0) {
              setTmdbSearchQuery('Batman');
              api.admin.searchTMDB('Batman').then((res) => setTmdbResults(res.results)).catch(() => {});
            }
          }}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Movie (Search TMDB)</span>
        </button>
      </div>

      {/* Filter and Bulk Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0d0f17] border border-zinc-800/80">
        {/* Search & Genre Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search catalog titles..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-500 hidden sm:inline">Genre:</span>
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action */}
        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-3 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
            <span className="text-xs text-amber-400 font-semibold">
              {selectedIds.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/25 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Bulk Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Movies Table */}
      <div className="rounded-2xl bg-[#0d0f17] border border-zinc-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={movies.length > 0 && selectedIds.length === movies.length}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-0"
                  />
                </th>
                <th className="p-4">Poster & Movie Title</th>
                <th className="p-4">TMDB ID</th>
                <th className="p-4">Genre / Rating</th>
                <th className="p-4">Status</th>
                <th className="p-4">Added Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500 animate-pulse">
                    Loading catalog records...
                  </td>
                </tr>
              ) : movies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-500">
                    <Film className="h-10 w-10 mx-auto text-zinc-700 mb-2" />
                    <p className="text-sm font-semibold text-zinc-400">No movies match filter</p>
                    <p className="text-xs text-zinc-600 mt-1">Use "Add Movie" to search TMDB and import titles</p>
                  </td>
                </tr>
              ) : (
                movies.map((m) => {
                  const isSelected = selectedIds.includes(m.id);
                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        isSelected ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(m.id)}
                          className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-0"
                        />
                      </td>

                      {/* Poster & Movie Title */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={m.posterUrl}
                            alt={m.title}
                            className="h-14 w-10 rounded-lg object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-sm text-zinc-100">{m.title}</p>
                            <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-xs">
                              {m.overview}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* TMDB ID */}
                      <td className="p-4 font-mono text-zinc-400">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                          #{m.tmdbId}
                        </span>
                      </td>

                      {/* Genre & Rating */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="text-[11px] font-medium text-zinc-300">
                            {m.genre || 'Cinema'}
                          </span>
                          <div className="flex items-center space-x-1 text-amber-400 font-bold text-[11px]">
                            <Star className="h-3 w-3 fill-amber-400" />
                            <span>{m.rating ? m.rating.toFixed(1) : '8.0'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Publication Status */}
                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePublish(m)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                            m.published
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                          }`}
                          title={m.published ? 'Click to Unpublish' : 'Click to Publish'}
                        >
                          {m.published ? (
                            <>
                              <Eye className="h-3 w-3" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Added Date */}
                      <td className="p-4 text-zinc-400 text-[11px]">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                            title="Edit Title & Stream URL"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteMovie(m)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                            title="Delete permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ADD MOVIE MODAL: ULTRA-SIMPLE TMDB ONE-CLICK INGESTION WORKFLOW */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-[#0d0f17] border border-zinc-800 shadow-2xl p-6 sm:p-7 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-white flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  <span>Add Movie via TMDB</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Search any movie on TMDB &bull; Poster and title automatically fetched &bull; Saved to database
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Notification (includes "This movie has already been added.") */}
            {addError && (
              <div className="mb-4 flex items-center space-x-2 rounded-xl bg-rose-500/15 border border-rose-500/40 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="font-semibold">{addError}</span>
              </div>
            )}

            {/* Success Notification */}
            {addSuccess && (
              <div className="mb-4 flex items-center space-x-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="font-semibold">{addSuccess}</span>
              </div>
            )}

            {/* Search TMDB Input */}
            <form onSubmit={handleTmdbSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={tmdbSearchQuery}
                  onChange={(e) => setTmdbSearchQuery(e.target.value)}
                  placeholder="Enter movie name (e.g. Oppenheimer, Dune, The Godfather)..."
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={searchingTmdb}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all disabled:opacity-50"
              >
                {searchingTmdb ? 'Searching...' : 'Search TMDB'}
              </button>
            </form>

            {/* Search Results Area */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                TMDB Search Results ({tmdbResults.length})
              </div>

              {tmdbResults.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <Search className="h-8 w-8 mx-auto text-zinc-700 mb-2" />
                  <p className="text-xs font-semibold text-zinc-400">Search TMDB above to preview titles</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tmdbResults.map((result) => {
                    const resultId = result.tmdbId || result.id;
                    const isSelected = (selectedTmdbMovie?.tmdbId || selectedTmdbMovie?.id) === resultId;
                    const resultYear = (result.releaseDate || result.release_date || '').split('-')[0];
                    return (
                      <div
                        key={resultId}
                        onClick={() => {
                          setSelectedTmdbMovie(result);
                          setAddError(null);
                        }}
                        className={`flex items-start space-x-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40'
                        }`}
                      >
                        <img
                          src={result.posterUrl}
                          alt={result.title}
                          className="h-20 w-14 rounded-lg object-cover bg-zinc-950 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="text-xs font-bold text-zinc-100 line-clamp-1">
                              {result.title}
                            </h4>
                            {isSelected && (
                              <div className="h-4 w-4 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0 ml-1">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-zinc-400 mt-1">
                            <span>TMDB #{resultId}</span>
                            {resultYear && (
                              <span>&bull; {resultYear}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                            {result.overview}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Movie Confirmation Card & Save Action */}
            {selectedTmdbMovie && (
              <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedTmdbMovie.posterUrl}
                    alt=""
                    className="h-12 w-9 rounded object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-100">
                      Selected: {selectedTmdbMovie.title}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      TMDB ID: {selectedTmdbMovie.tmdbId || selectedTmdbMovie.id} &bull; Poster URL captured
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmAddMovie}
                  disabled={addingToDb}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
                >
                  {addingToDb ? 'Saving to Database...' : 'Add Movie & Save to Database'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT MOVIE MODAL */}
      {/* ========================================================================= */}
      {editingMovie && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setEditingMovie(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#0d0f17] border border-zinc-800 shadow-2xl p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white">Edit Title Information</h3>
              <button
                onClick={() => setEditingMovie(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Genre</label>
                  <input
                    type="text"
                    value={editGenre}
                    onChange={(e) => setEditGenre(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Duration</label>
                <input
                  type="text"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  placeholder="e.g. 152 min"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Stream Video URL (Authorized Demo Media)
                </label>
                <input
                  type="url"
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingMovie(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

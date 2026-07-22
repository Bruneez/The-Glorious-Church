import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import MachanehMoviesPosterGrid from '@/components/features/machaneh-movies/MachanehMoviesPosterGrid';
import MachanehMoviesForm from '@/components/features/machaneh-movies/MachanehMoviesForm';
import MachanehMoviesViewModal from '@/components/features/machaneh-movies/MachanehMoviesViewModal';
import MachanehMoviesDeleteModal from '@/components/features/machaneh-movies/MachanehMoviesDeleteModal';
import {
  filterMachanehMovies,
  getEmptyMachanehMoviesMessage,
} from '@/config/machanehMoviesOptions';
import {
  createMachanehMovie,
  deleteMachanehMovie,
  replaceMachanehMoviePoster,
  updateMachanehMovie,
  useMachanehMovies,
} from '@/services/machanehMoviesService';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';

function FeedbackBanner({ feedback, onDismiss }) {
  if (!feedback?.message) return null;

  const toneClass =
    feedback.type === 'success'
      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
      : feedback.type === 'warning'
        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400';

  return (
    <div
      className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between gap-3 ${toneClass}`}
    >
      <span>{feedback.message}</span>
      <button type="button" onClick={onDismiss} className="text-current hover:opacity-80 shrink-0">
        Dismiss
      </button>
    </div>
  );
}

export default function MachanehMoviesPage() {
  const { data: movies = [], loading, error } = useMachanehMovies();
  const { staffProfile, firebaseUser, role } = useAuth();
  const { canPerformAction } = useRoleAccess();
  const canManage = canPerformAction('MANAGE_MACHANEH_MOVIES');

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [viewingMovie, setViewingMovie] = useState(null);
  const [deletingMovie, setDeletingMovie] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplacingPoster, setIsReplacingPoster] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const filteredMovies = useMemo(
    () => filterMachanehMovies(movies, searchTerm),
    [movies, searchTerm],
  );

  const emptyMessage = getEmptyMachanehMoviesMessage(searchTerm, canManage);

  const createdBy =
    staffProfile?.fullName ||
    staffProfile?.name ||
    firebaseUser?.displayName ||
    firebaseUser?.email ||
    'Admin';

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  const handleAddMovie = () => {
    if (!canManage) return;
    setEditingMovie(null);
    setIsFormOpen(true);
  };

  const handleEditMovie = (movie) => {
    if (!canManage) return;
    setViewingMovie(null);
    setEditingMovie(movie);
    setIsFormOpen(true);
  };

  const handleViewMovie = (movie) => {
    setViewingMovie(movie);
  };

  const handleDeletePrompt = (movie) => {
    if (!canManage) return;
    setViewingMovie(null);
    setDeletingMovie(movie);
  };

  const handleFormSubmit = async ({ formData, posterFile, removePoster }) => {
    if (!canManage) {
      throw new Error('You do not have permission to manage Machaneh Movies.');
    }

    if (editingMovie) {
      const { storageWarnings = [] } = await updateMachanehMovie(editingMovie.id, formData, {
        role,
        createdBy,
        initialData: editingMovie,
        posterFile,
        removePoster,
      });

      if (storageWarnings.length) {
        showFeedback('warning', `Movie updated successfully. ${storageWarnings.join(' ')}`);
      } else {
        showFeedback('success', 'Movie updated successfully.');
      }
    } else {
      const { storageWarnings = [] } = await createMachanehMovie(formData, {
        role,
        createdBy,
        posterFile,
      });

      if (storageWarnings.length) {
        showFeedback('warning', `Movie added successfully. ${storageWarnings.join(' ')}`);
      } else {
        showFeedback('success', 'Movie added successfully.');
      }
    }

    setIsFormOpen(false);
    setEditingMovie(null);
  };

  const handleReplacePoster = async (movie, posterFile) => {
    if (!canManage) return;

    setIsReplacingPoster(true);

    try {
      const { storageWarnings = [] } = await replaceMachanehMoviePoster(movie.id, posterFile, {
        role,
        initialData: movie,
      });

      if (storageWarnings.length) {
        showFeedback('warning', `Poster replaced successfully. ${storageWarnings.join(' ')}`);
      } else {
        showFeedback('success', 'Poster replaced successfully.');
      }

      setViewingMovie(null);
    } catch (replaceError) {
      console.error('Error replacing movie poster:', replaceError);
      showFeedback('error', replaceError?.message || 'Failed to replace poster. Please try again.');
    } finally {
      setIsReplacingPoster(false);
    }
  };

  const handleDeleteConfirm = async (movie) => {
    setIsDeleting(true);

    try {
      const { storageWarnings = [] } = await deleteMachanehMovie(movie.id, {
        role,
        initialData: movie,
      });

      if (storageWarnings.length) {
        showFeedback('warning', `Movie deleted successfully. ${storageWarnings.join(' ')}`);
      } else {
        showFeedback('success', 'Movie deleted successfully.');
      }

      setDeletingMovie(null);
    } catch (deleteError) {
      console.error('Error deleting movie:', deleteError);
      showFeedback('error', deleteError?.message || 'Failed to delete movie. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-root">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white tracking-wide">Machaneh Movies</h1>
          <p className="text-sm text-slate-400 mt-1">
            A library of movies recommended for church leadership, camps, and ministry.
          </p>
        </div>
        {canManage ? (
          <Button icon={Plus} onClick={handleAddMovie} className="shrink-0 w-full sm:w-auto">
            Add Movie
          </Button>
        ) : null}
      </div>

      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

      <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm">
        <div className="p-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="search"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              aria-label="Search movies"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-rose-400 text-xs">
                {error?.message || 'Failed to load movies. Please refresh and try again.'}
              </p>
            </div>
          ) : (
            <MachanehMoviesPosterGrid
              movies={filteredMovies}
              onOpen={handleViewMovie}
              emptyMessage={emptyMessage}
              canManage={canManage}
              onAddMovie={handleAddMovie}
            />
          )}
        </div>
      </div>

      {canManage ? (
        <MachanehMoviesForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingMovie(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingMovie}
        />
      ) : null}

      <MachanehMoviesViewModal
        movie={viewingMovie}
        isOpen={Boolean(viewingMovie)}
        onClose={() => setViewingMovie(null)}
        onEdit={canManage ? handleEditMovie : undefined}
        onDelete={canManage ? handleDeletePrompt : undefined}
        onReplacePoster={canManage ? handleReplacePoster : undefined}
        canManage={canManage}
        isReplacingPoster={isReplacingPoster}
      />

      {canManage ? (
        <MachanehMoviesDeleteModal
          movie={deletingMovie}
          isOpen={Boolean(deletingMovie)}
          onClose={() => setDeletingMovie(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      ) : null}
    </div>
  );
}

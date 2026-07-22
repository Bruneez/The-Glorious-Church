import { ImageOff } from 'lucide-react';
import { getMoviePosterAlt, getMoviePosterUrl, getMovieTitle } from '@/config/machanehMoviesDisplay';

function MoviePoster({ movie, className = '' }) {
  const posterUrl = getMoviePosterUrl(movie);
  const posterAlt = getMoviePosterAlt(movie);

  if (!posterUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800 border border-slate-700/70 ${className}`}
        role="img"
        aria-label={posterAlt}
      >
        <div className="text-center px-3">
          <ImageOff className="w-7 h-7 text-slate-600 mx-auto mb-1.5" aria-hidden="true" />
          <p className="text-[10px] text-slate-500 font-medium">No poster provided</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={posterUrl}
      alt={posterAlt}
      className={`object-cover bg-slate-800 ${className}`}
    />
  );
}

function MoviePosterCard({ movie, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(movie)}
      className="group text-left rounded-xl overflow-hidden border border-slate-700/70 bg-slate-900/60 hover:border-indigo-500/40 hover:bg-slate-900/80 hover:-translate-y-0.5 transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
      aria-label={`View details for ${getMovieTitle(movie)}`}
    >
      <MoviePoster
        movie={movie}
        className="w-full aspect-[2/3] group-hover:scale-[1.02] transition-transform duration-300"
      />
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-bold text-white tracking-wide line-clamp-2">
          {getMovieTitle(movie)}
        </h3>
        {movie.genre ? (
          <p className="text-[11px] text-indigo-400/90 font-medium">{movie.genre}</p>
        ) : null}
      </div>
    </button>
  );
}

export default function MachanehMoviesPosterGrid({
  movies = [],
  onOpen,
  emptyMessage = 'No movies have been added yet.',
  canManage = false,
  onAddMovie,
}) {
  if (!movies.length) {
    return (
      <div className="py-14 px-6 text-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30">
        <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">{emptyMessage}</p>
        {canManage && onAddMovie ? (
          <button
            type="button"
            onClick={onAddMovie}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
          >
            + Add Movie
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <MoviePosterCard key={movie.id} movie={movie} onOpen={onOpen} />
      ))}
    </div>
  );
}

export { MoviePoster };

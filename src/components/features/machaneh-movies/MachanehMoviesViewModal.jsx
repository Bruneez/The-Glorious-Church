import { useRef } from 'react';
import { Clapperboard, Edit2, Trash2, ImageUp } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { MoviePoster } from '@/components/features/machaneh-movies/MachanehMoviesPosterGrid';
import {
  formatMovieDetailValue,
  formatMovieReleaseYear,
  getMovieTitle,
} from '@/config/machanehMoviesDisplay';
import { ACCEPTED_MOVIE_POSTER_ACCEPT, normalizeMinistryTags, validateMoviePosterFile } from '@/config/machanehMoviesOptions';

function DetailField({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-sm font-medium text-white mt-1">{value}</p>
    </div>
  );
}

function MinistryTagList({ tags = [] }) {
  const normalizedTags = normalizeMinistryTags(tags);

  if (!normalizedTags.length) {
    return <span className="text-slate-500">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {normalizedTags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-600/15 border border-indigo-500/20 text-indigo-300"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export default function MachanehMoviesViewModal({
  movie,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onReplacePoster,
  canManage = false,
  isReplacingPoster = false,
}) {
  const replaceInputRef = useRef(null);

  if (!movie) return null;

  const handleReplacePosterChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !onReplacePoster) return;

    const validationMessage = validateMoviePosterFile(file);
    if (validationMessage) {
      window.alert(validationMessage);
      return;
    }

    await onReplacePoster(movie, file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Movie Details"
      icon={Clapperboard}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-5">
          <MoviePoster movie={movie} className="w-full max-w-[220px] mx-auto md:mx-0 aspect-[2/3] rounded-xl" />

          <div className="space-y-4 min-w-0">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-wide">{getMovieTitle(movie)}</h3>
              {movie.genre ? (
                <p className="text-sm text-indigo-400/90 font-medium mt-1">{movie.genre}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailField label="Release Year" value={formatMovieReleaseYear(movie)} />
              <DetailField label="Duration" value={formatMovieDetailValue(movie.duration)} />
              <DetailField label="Language" value={formatMovieDetailValue(movie.language)} />
              <DetailField label="Age Recommendation" value={formatMovieDetailValue(movie.ageRecommendation)} />
            </div>

            <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ministry Tags</p>
              <MinistryTagList tags={movie.ministryTags} />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-700/70 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Description</p>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {formatMovieDetailValue(movie.description)}
          </p>
        </div>

        {canManage ? (
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-2 border-t border-slate-700">
            {onEdit ? (
              <Button type="button" variant="secondary" icon={Edit2} onClick={() => onEdit(movie)}>
                Edit
              </Button>
            ) : null}
            {onReplacePoster ? (
              <>
                <input
                  ref={replaceInputRef}
                  type="file"
                  accept={ACCEPTED_MOVIE_POSTER_ACCEPT}
                  className="hidden"
                  onChange={handleReplacePosterChange}
                />
                <Button
                  type="button"
                  variant="secondary"
                  icon={ImageUp}
                  isLoading={isReplacingPoster}
                  disabled={isReplacingPoster}
                  onClick={() => replaceInputRef.current?.click()}
                >
                  Replace Poster
                </Button>
              </>
            ) : null}
            {onDelete ? (
              <Button type="button" variant="danger" icon={Trash2} onClick={() => onDelete(movie)}>
                Delete
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { getMovieTitle } from '@/config/machanehMoviesDisplay';

export default function MachanehMoviesDeleteModal({
  movie,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  if (!movie) return null;

  const handleConfirm = async () => {
    await onConfirm(movie);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Movie" icon={AlertTriangle}>
      <div className="space-y-4">
        <p className="text-slate-300 text-xs leading-relaxed">
          Delete this movie? This will permanently remove the movie from the Machaneh Movies library
          for all users.
        </p>
        <p className="text-[11px] text-slate-400">
          Movie:{' '}
          <span className="font-semibold text-white">{getMovieTitle(movie)}</span>
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} isLoading={isDeleting}>
            Delete Movie
          </Button>
        </div>
      </div>
    </Modal>
  );
}

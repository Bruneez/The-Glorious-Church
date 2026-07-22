import { useEffect, useState } from 'react';
import { Clapperboard } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ImageUploadField from '@/components/common/ImageUploadField';
import {
  AGE_RECOMMENDATION_OPTIONS,
  ACCEPTED_MOVIE_POSTER_ACCEPT,
  MINISTRY_TAG_OPTIONS,
  MOVIE_GENRE_OPTIONS,
  mapMachanehMovieToFormData,
  validateMachanehMovieForm,
  validateMoviePosterFile,
} from '@/config/machanehMoviesOptions';
import { getMachanehMoviePosterStorageErrorMessage } from '@/config/machanehMoviesPosterValidation';
import { getMoviePosterUrl } from '@/config/machanehMoviesDisplay';
import { resolveMachanehMoviePosterStoragePath } from '@/utils/storagePathUtils';

function MinistryTagSelector({ selectedTags, onToggle }) {
  return (
    <div>
      <p className="block text-slate-400 mb-2 font-medium text-xs">Ministry Tags</p>
      <div className="flex flex-wrap gap-2">
        {MINISTRY_TAG_OPTIONS.map((tag) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MachanehMoviesForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const [formData, setFormData] = useState(mapMachanehMovieToFormData(null));
  const [posterFile, setPosterFile] = useState(null);
  const [removePoster, setRemovePoster] = useState(false);
  const [posterError, setPosterError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (!isOpen) return;

    setFormData(mapMachanehMovieToFormData(initialData));
    setPosterFile(null);
    setRemovePoster(false);
    setPosterError('');
    setFormError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => {
      const ministryTags = prev.ministryTags.includes(tag)
        ? prev.ministryTags.filter((item) => item !== tag)
        : [...prev.ministryTags, tag];

      return { ...prev, ministryTags };
    });
  };

  const handlePosterSelect = (file) => {
    const validationMessage = validateMoviePosterFile(file);
    if (validationMessage) {
      setPosterError(validationMessage);
      setPosterFile(null);
      return;
    }

    setPosterError('');
    setPosterFile(file);
    setRemovePoster(false);
  };

  const handlePosterRemove = () => {
    setPosterFile(null);
    setRemovePoster(true);
    setPosterError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const hasExistingPoster = Boolean(
      getMoviePosterUrl(formData)
      || resolveMachanehMoviePosterStoragePath(formData)
      || resolveMachanehMoviePosterStoragePath(initialData),
    );

    const validationMessage = validateMachanehMovieForm(formData, {
      requirePoster: !isEditing && !posterFile,
    });

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    if (!posterFile && removePoster && !hasExistingPoster) {
      setPosterError('Poster image is required.');
      return;
    }

    if (posterFile) {
      const posterValidationMessage = validateMoviePosterFile(posterFile);
      if (posterValidationMessage) {
        setPosterError(posterValidationMessage);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        formData: {
          ...formData,
          previousPosterPath:
            removePoster || posterFile
              ? resolveMachanehMoviePosterStoragePath(initialData)
              : '',
        },
        posterFile,
        removePoster,
      });
    } catch (submitError) {
      setFormError(
        getMachanehMoviePosterStorageErrorMessage(submitError)
          || submitError?.message
          || 'Failed to save movie. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingPosterUrl = !removePoster && !posterFile ? getMoviePosterUrl(formData) : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Movie' : 'Add Movie'}
      icon={Clapperboard}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Movie Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter movie title"
          required
        />

        <div>
          <label htmlFor="movie-description" className="block text-slate-400 mb-1 font-medium text-xs">
            Description
          </label>
          <textarea
            id="movie-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Story summary, ministry value, recommended audience, notes..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-y min-h-[120px]"
          />
        </div>

        <ImageUploadField
          label="Poster Image"
          existingImageUrl={existingPosterUrl}
          selectedFile={posterFile}
          onFileSelect={handlePosterSelect}
          onRemove={handlePosterRemove}
          accept={ACCEPTED_MOVIE_POSTER_ACCEPT}
          maxSizeMB={5}
          disabled={isSubmitting}
          loading={isSubmitting}
          previewShape="square"
          previewName={formData.title || 'Movie poster'}
          helperText="JPG, PNG, or WEBP up to 5 MB."
          error={posterError}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            options={MOVIE_GENRE_OPTIONS}
            placeholder="Select genre"
          />
          <Input
            label="Release Year"
            name="releaseYear"
            type="number"
            value={formData.releaseYear}
            onChange={handleChange}
            placeholder="e.g. 2018"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g. 1 hr 42 min"
          />
          <Input
            label="Language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            placeholder="e.g. English"
          />
        </div>

        <Select
          label="Age Recommendation"
          name="ageRecommendation"
          value={formData.ageRecommendation}
          onChange={handleChange}
          options={AGE_RECOMMENDATION_OPTIONS}
          placeholder="Select age recommendation"
        />

        <MinistryTagSelector
          selectedTags={formData.ministryTags}
          onToggle={handleTagToggle}
        />

        {formError ? <p className="text-rose-400 text-[11px]">{formError}</p> : null}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add Movie'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

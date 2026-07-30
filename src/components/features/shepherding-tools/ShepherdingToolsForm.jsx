import { useEffect, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ImageUploadField from '@/components/common/ImageUploadField';
import {
  BOOK_CATEGORY_OPTIONS,
  BOOK_LINK_ACTION_OPTIONS,
  MUSIC_RESOURCE_SUBTYPE_OPTIONS,
  PUBLISHED_STATUS_OPTIONS,
  SHEPHERDING_AUDIO_PLATFORM_OPTIONS,
  SHEPHERDING_CATEGORY_OPTIONS,
  SHEPHERDING_MUSIC_PLATFORM_OPTIONS,
  SHEPHERDING_RESOURCE_TYPES,
  SHEPHERDING_VIDEO_PLATFORM_OPTIONS,
} from '@/config/shepherdingToolsConstants';
import {
  ACCEPTED_SHEPHERDING_COVER_ACCEPT,
  buildShepherdingResourceFormPayload,
  getShepherdingResourceValidationErrors,
  mapShepherdingResourceToFormData,
  validateShepherdingCoverFile,
} from '@/config/shepherdingToolsResourceOptions';
import { getResourceCoverUrl } from '@/config/shepherdingToolsDisplay';
import { getShepherdingToolsTabById } from '@/config/shepherdingToolsOptions';
import { resolveShepherdingCoverStoragePath } from '@/utils/storagePathUtils';

const FORM_ID = 'shepherding-tools-form';

function getPlatformOptions(resourceType) {
  if (resourceType === SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON) {
    return SHEPHERDING_AUDIO_PLATFORM_OPTIONS;
  }
  if (resourceType === SHEPHERDING_RESOURCE_TYPES.VIDEO_SERMON) {
    return SHEPHERDING_VIDEO_PLATFORM_OPTIONS;
  }
  if (resourceType === SHEPHERDING_RESOURCE_TYPES.MUSIC) {
    return SHEPHERDING_MUSIC_PLATFORM_OPTIONS;
  }
  return [];
}

function getCategoryOptions(resourceType) {
  if (resourceType === SHEPHERDING_RESOURCE_TYPES.BOOK) {
    return BOOK_CATEGORY_OPTIONS;
  }
  return SHEPHERDING_CATEGORY_OPTIONS;
}

function TextAreaField({ label, value, onChange, rows = 4, error = '' }) {
  return (
    <div>
      <label className="block text-slate-400 mb-1.5 font-medium text-xs">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        className={`w-full bg-slate-900 border rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none ${
          error ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
        }`}
      />
      {error ? <p className="text-[11px] text-rose-400 mt-1">{error}</p> : null}
    </div>
  );
}

export default function ShepherdingToolsForm({
  resourceType,
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const [formData, setFormData] = useState(mapShepherdingResourceToFormData(null, resourceType));
  const [coverFile, setCoverFile] = useState(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const errorBannerRef = useRef(null);

  const isEditing = Boolean(initialData?.id);
  const tabConfig = getShepherdingToolsTabById(resourceType);
  const isDevotional = resourceType === SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL;
  const hasExistingCover = Boolean(getResourceCoverUrl(initialData));

  useEffect(() => {
    if (!isOpen) {
      setFormData(mapShepherdingResourceToFormData(null, resourceType));
      setCoverFile(null);
      setRemoveCover(false);
      setFieldErrors({});
      setFormError('');
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

    setFormData(mapShepherdingResourceToFormData(initialData, resourceType));
    setCoverFile(null);
    setRemoveCover(false);
    setFieldErrors({});
    setFormError('');
    setIsSubmitting(false);
    isSubmittingRef.current = false;
  }, [initialData, isOpen, resourceType]);

  const updateField = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmittingRef.current) return;

    const errors = getShepherdingResourceValidationErrors(formData, {
      coverFile,
      removeCover,
      hasExistingCover: hasExistingCover && !removeCover,
    });

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setFormError(errors.form || '');
      errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = buildShepherdingResourceFormPayload(formData, {
        themeTagsInput: formData.themeTagsInput,
      });

      await onSubmit({
        formData: {
          ...payload,
          resourceType,
          previousCoverPath: resolveShepherdingCoverStoragePath(initialData),
        },
        coverFile,
        removeCover,
      });
    } catch (error) {
      setFormError(error?.message || 'The resource could not be saved. Please try again.');
      errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const platformOptions = getPlatformOptions(resourceType);
  const categoryOptions = getCategoryOptions(resourceType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${tabConfig.label.replace(/s$/, '')}` : tabConfig.addLabel}
      icon={BookOpen}
      maxWidth="max-w-2xl"
      panelClassName="p-0"
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col max-h-[80vh]">
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {formError ? (
            <div
              ref={errorBannerRef}
              className="rounded-lg border border-rose-500/20 bg-rose-950/30 p-3 text-xs text-rose-400"
            >
              {formError}
            </div>
          ) : null}

          <Input
            label="Title"
            value={formData.title}
            onChange={(event) => updateField('title', event.target.value)}
            error={fieldErrors.title}
            required
          />

          {(resourceType === SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON
            || resourceType === SHEPHERDING_RESOURCE_TYPES.VIDEO_SERMON) && (
            <Input
              label="Speaker"
              value={formData.speaker}
              onChange={(event) => updateField('speaker', event.target.value)}
              error={fieldErrors.speaker}
              required
            />
          )}

          {resourceType === SHEPHERDING_RESOURCE_TYPES.MUSIC && (
            <Input
              label="Artist or Ministry"
              value={formData.artist}
              onChange={(event) => updateField('artist', event.target.value)}
              error={fieldErrors.artist}
              required
            />
          )}

          {resourceType === SHEPHERDING_RESOURCE_TYPES.BOOK && (
            <>
              <Input
                label="Author"
                value={formData.author}
                onChange={(event) => updateField('author', event.target.value)}
                error={fieldErrors.author}
                required
              />
              <Select
                label="Link Action Label"
                value={formData.linkActionLabel}
                onChange={(event) => updateField('linkActionLabel', event.target.value)}
                options={[{ value: '', label: 'Access Book (default)' }, ...BOOK_LINK_ACTION_OPTIONS]}
              />
            </>
          )}

          {!isDevotional ? (
            <Input
              label="External URL"
              value={formData.externalUrl}
              onChange={(event) => updateField('externalUrl', event.target.value)}
              error={fieldErrors.externalUrl}
              required
            />
          ) : (
            <Input
              label="Optional External Link"
              value={formData.externalUrl}
              onChange={(event) => updateField('externalUrl', event.target.value)}
              error={fieldErrors.externalUrl}
            />
          )}

          {platformOptions.length ? (
            <Select
              label="Platform"
              value={formData.platform}
              onChange={(event) => updateField('platform', event.target.value)}
              options={[{ value: '', label: 'Select platform' }, ...platformOptions]}
            />
          ) : null}

          {resourceType === SHEPHERDING_RESOURCE_TYPES.MUSIC && (
            <Select
              label="Resource Type"
              value={formData.resourceSubtype}
              onChange={(event) => updateField('resourceSubtype', event.target.value)}
              options={[{ value: '', label: 'Select type' }, ...MUSIC_RESOURCE_SUBTYPE_OPTIONS]}
            />
          )}

          {(resourceType === SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON
            || resourceType === SHEPHERDING_RESOURCE_TYPES.VIDEO_SERMON) && (
            <>
              <Input
                label="Date Preached"
                type="date"
                value={formData.datePreached}
                onChange={(event) => updateField('datePreached', event.target.value)}
              />
              <Input
                label="Series"
                value={formData.series}
                onChange={(event) => updateField('series', event.target.value)}
              />
            </>
          )}

          {isDevotional && (
            <>
              <Input
                label="Date"
                type="date"
                value={formData.resourceDate}
                onChange={(event) => updateField('resourceDate', event.target.value)}
                error={fieldErrors.resourceDate}
                required
              />
              <Input
                label="Scripture Reference"
                value={formData.scriptureReference}
                onChange={(event) => updateField('scriptureReference', event.target.value)}
                placeholder="Psalm 23:1–6"
              />
              <TextAreaField
                label="Devotional Content"
                value={formData.devotionalContent}
                onChange={(event) => updateField('devotionalContent', event.target.value)}
                rows={8}
                error={fieldErrors.devotionalContent}
              />
              <Input
                label="Themes or Tags"
                value={formData.themeTagsInput}
                onChange={(event) => updateField('themeTagsInput', event.target.value)}
                placeholder="Faith, Prayer, Leadership"
              />
            </>
          )}

          {!isDevotional && (
            <Select
              label="Category"
              value={formData.category}
              onChange={(event) => updateField('category', event.target.value)}
              options={[{ value: '', label: 'Select category' }, ...categoryOptions]}
            />
          )}

          {resourceType === SHEPHERDING_RESOURCE_TYPES.BOOK && (
            <Input
              label="Publication Year"
              value={formData.publicationYear}
              onChange={(event) => updateField('publicationYear', event.target.value)}
            />
          )}

          {!isDevotional && (
            <>
              <TextAreaField
                label="Short Description"
                value={formData.shortDescription}
                onChange={(event) => updateField('shortDescription', event.target.value)}
                rows={3}
              />
              <TextAreaField
                label="Full Description"
                value={formData.fullDescription}
                onChange={(event) => updateField('fullDescription', event.target.value)}
                rows={5}
              />
            </>
          )}

          {!isDevotional && (
            <ImageUploadField
              label={resourceType === SHEPHERDING_RESOURCE_TYPES.VIDEO_SERMON ? 'Thumbnail Image' : 'Cover Image'}
              accept={ACCEPTED_SHEPHERDING_COVER_ACCEPT}
              existingImageUrl={removeCover ? '' : getResourceCoverUrl({ ...formData, coverImageUrl: formData.coverImageUrl })}
              selectedFile={coverFile}
              previewShape={resourceType === SHEPHERDING_RESOURCE_TYPES.BOOK ? 'square' : 'square'}
              error={fieldErrors.cover}
              onFileSelect={(file) => {
                const message = file ? validateShepherdingCoverFile(file) : '';
                if (message) {
                  setFieldErrors((previous) => ({ ...previous, cover: message }));
                  return;
                }
                setCoverFile(file);
                setRemoveCover(false);
                setFieldErrors((previous) => ({ ...previous, cover: '' }));
              }}
              onRemove={() => {
                setCoverFile(null);
                setRemoveCover(true);
              }}
            />
          )}

          <Select
            label="Published Status"
            value={formData.publishedStatus}
            onChange={(event) => updateField('publishedStatus', event.target.value)}
            options={PUBLISHED_STATUS_OPTIONS}
          />

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={formData.notificationEnabled}
              onChange={(event) => updateField('notificationEnabled', event.target.checked)}
              className="rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
            />
            Notify users when this resource is published
          </label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-4 border-t border-slate-700 bg-slate-900/80">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : tabConfig.addLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

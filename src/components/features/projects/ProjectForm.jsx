import { useEffect, useMemo, useState } from 'react';
import { FolderKanban, Plus, Trash2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ImageUploadField from '@/components/common/ImageUploadField';
import { ProjectCoverImage } from '@/components/features/projects/ProjectCard';
import {
  ACCEPTED_PROJECT_COVER_ACCEPT,
  buildProjectLeaderOptions,
  createProjectObjectiveId,
  getProjectErrorMessage,
  mapProjectToFormData,
  PROJECT_CATEGORY_OPTIONS,
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_JOINING_METHOD_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_SUMMARY_MAX_LENGTH,
  resolveProjectLeaderFields,
  validateProjectCoverFile,
  validateProjectForm,
} from '@/config/projectsOptions';
import { getProjectCoverUrl } from '@/config/projectsDisplay';

function FormSection({ title, children }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  required = false,
  rows = 4,
  error = '',
  placeholder = '',
  maxLength,
}) {
  const inputId = name || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div>
      {label ? (
        <label htmlFor={inputId} className="block text-slate-400 mb-1 font-medium text-xs">
          {label}
          {required ? <span className="text-rose-400 ml-1">*</span> : null}
        </label>
      ) : null}
      <textarea
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs resize-y min-h-[5rem] ${error ? 'border-rose-500' : ''}`}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-rose-400 text-[10px] mt-1">{error}</p>
      ) : null}
    </div>
  );
}

export default function ProjectForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  staff = [],
  mode = 'create',
}) {
  const [formData, setFormData] = useState(mapProjectToFormData(null));
  const [coverFile, setCoverFile] = useState(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [coverError, setCoverError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = mode === 'edit' && Boolean(initialData?.id);
  const leaderOptions = useMemo(() => buildProjectLeaderOptions(staff), [staff]);

  useEffect(() => {
    if (!isOpen) return;

    setFormData(mapProjectToFormData(initialData));
    setCoverFile(null);
    setRemoveCover(false);
    setFieldErrors({});
    setFormError('');
    setCoverError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setFormError('');
  };

  const handleLeaderChange = (event) => {
    const leaderUserId = event.target.value;
    const selected = leaderOptions.find((option) => option.value === leaderUserId);

    setFormData((prev) => ({
      ...prev,
      leaderUserId,
      leaderStaffId: selected?.staffId || '',
      leaderName: selected?.name || '',
    }));
    setFieldErrors((prev) => ({ ...prev, leaderUserId: '' }));
  };

  const handleObjectiveChange = (objectiveId, value) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.map((objective) => (
        objective.id === objectiveId ? { ...objective, text: value } : objective
      )),
    }));
  };

  const handleAddObjective = () => {
    setFormData((prev) => ({
      ...prev,
      objectives: [...prev.objectives, { id: createProjectObjectiveId(), text: '' }],
    }));
  };

  const handleRemoveObjective = (objectiveId) => {
    setFormData((prev) => {
      const nextObjectives = prev.objectives.filter((objective) => objective.id !== objectiveId);
      return {
        ...prev,
        objectives: nextObjectives.length
          ? nextObjectives
          : [{ id: createProjectObjectiveId(), text: '' }],
      };
    });
  };

  const handleCoverSelect = (file) => {
    const validationMessage = validateProjectCoverFile(file);
    if (validationMessage) {
      setCoverError(validationMessage);
      setCoverFile(null);
      return;
    }

    setCoverError('');
    setCoverFile(file);
    setRemoveCover(false);
  };

  const handleCoverRemove = () => {
    setCoverFile(null);
    setRemoveCover(true);
    setCoverError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setFormError('');
    setCoverError('');

    const leaderFields = resolveProjectLeaderFields(formData, staff);
    const submissionData = {
      ...formData,
      ...leaderFields,
    };

    const validationMessage = validateProjectForm(submissionData);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    if (coverFile) {
      const coverValidationMessage = validateProjectCoverFile(coverFile);
      if (coverValidationMessage) {
        setCoverError(coverValidationMessage);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        formData: submissionData,
        coverFile,
        removeCover,
      });
      onClose?.();
    } catch (submitError) {
      setFormError(getProjectErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingCoverUrl = !removeCover && !coverFile
    ? getProjectCoverUrl(initialData) || getProjectCoverUrl(formData)
    : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Create Project'}
      icon={FolderKanban}
      maxWidth="max-w-3xl"
      preventClose={isSubmitting}
      panelClassName="p-4 space-y-4 max-h-[85vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Core Information">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            error={fieldErrors.title}
          />
          <TextAreaField
            label="Summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            required
            rows={3}
            maxLength={PROJECT_SUMMARY_MAX_LENGTH}
            placeholder={`Brief overview (${PROJECT_SUMMARY_MAX_LENGTH} characters max)`}
            error={fieldErrors.summary}
          />
          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            error={fieldErrors.description}
          />
        </FormSection>

        <FormSection title="Planning">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={PROJECT_STATUS_OPTIONS}
            />
            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={PROJECT_PRIORITY_OPTIONS}
            />
          </div>
          <Input
            label="Progress (%)"
            name="progress"
            type="number"
            min={0}
            max={100}
            value={formData.progress}
            onChange={handleChange}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
            />
            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        <FormSection title="Project Leader">
          <Select
            label="Leader"
            name="leaderUserId"
            value={formData.leaderUserId}
            onChange={handleLeaderChange}
            options={leaderOptions}
            placeholder="Select project leader"
            error={fieldErrors.leaderUserId}
          />
        </FormSection>

        <FormSection title="Objectives">
          <div className="space-y-2">
            {formData.objectives.map((objective, index) => (
              <div key={objective.id} className="flex items-start gap-2">
                <Input
                  label={index === 0 ? 'Objective' : ''}
                  name={`objective-${objective.id}`}
                  value={objective.text}
                  onChange={(event) => handleObjectiveChange(objective.id, event.target.value)}
                  placeholder={`Objective ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  icon={Trash2}
                  onClick={() => handleRemoveObjective(objective.id)}
                  disabled={isSubmitting}
                  className="mt-5 shrink-0"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            icon={Plus}
            onClick={handleAddObjective}
            disabled={isSubmitting || formData.objectives.length >= 10}
          >
            Add Objective
          </Button>
        </FormSection>

        <FormSection title="Expected Outcome">
          <TextAreaField
            label="Expected Outcome"
            name="expectedOutcome"
            value={formData.expectedOutcome}
            onChange={handleChange}
            required
            rows={4}
            error={fieldErrors.expectedOutcome}
          />
        </FormSection>

        <FormSection title="Joining Method">
          <Select
            label="Joining Method"
            name="joiningMethod"
            value={formData.joiningMethod}
            onChange={handleChange}
            options={PROJECT_JOINING_METHOD_OPTIONS}
          />
        </FormSection>

        <FormSection title="Project Category">
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={PROJECT_CATEGORY_OPTIONS}
          />
        </FormSection>

        <FormSection title="Cover Image">
          {existingCoverUrl && !coverFile ? (
            <div className="rounded-xl overflow-hidden border border-slate-700 mb-3">
              <ProjectCoverImage
                project={{ title: formData.title, coverUrl: existingCoverUrl }}
                className="aspect-video w-full"
              />
            </div>
          ) : null}

          <ImageUploadField
            label="Cover Image"
            existingImageUrl={existingCoverUrl}
            selectedFile={coverFile}
            onFileSelect={handleCoverSelect}
            onRemove={handleCoverRemove}
            accept={ACCEPTED_PROJECT_COVER_ACCEPT}
            previewShape="square"
            helperText="JPG, PNG, or WEBP up to 5 MB."
            error={coverError}
            disabled={isSubmitting}
            loading={isSubmitting}
            previewName={formData.title || 'Project cover'}
          />
        </FormSection>

        {formError ? (
          <div role="alert" className="rounded-lg border border-rose-500/20 bg-rose-950/30 p-3 text-xs text-rose-400">
            {formError}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-700/60">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

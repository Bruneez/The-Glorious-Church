import { useEffect, useRef, useState } from 'react';
import { Bug } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import AppFixAttachmentUploadField from '@/components/features/app-fixes/AppFixAttachmentUploadField';
import {
  APP_FIX_BROWSER_MODE_OPTIONS,
  APP_FIX_CATEGORY,
  APP_FIX_CATEGORY_OPTIONS,
  APP_FIX_DEVICE_TYPE_OPTIONS,
  APP_FIX_PRIORITY_OPTIONS,
} from '@/config/appFixesConstants';
import {
  createEmptyAppFixReportFormData,
  getAppFixAffectedModuleOptions,
  mapAppFixRequestToFormData,
} from '@/config/appFixesOptions';
import { getAppFixRequestValidationErrors } from '@/config/appFixesRequestOptions';
import { getAppFixErrorMessage } from '@/config/appFixesErrorMessages';
import { validateAppFixAttachmentFile } from '@/config/appFixesAttachmentOptions';
import { canUserEditRequestByStatus } from '@/config/appFixesDisplay';
import { useRoleAccess } from '@/hooks/useRoleAccess';

const FORM_ID = 'app-fix-report-form';

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  error = '',
  required = false,
  disabled = false,
  id,
}) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div>
      <label htmlFor={fieldId} className="block text-slate-400 mb-1.5 font-medium text-xs">
        {label}
        {required ? <span className="text-rose-400 ml-1">*</span> : null}
      </label>
      <textarea
        id={fieldId}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`w-full bg-slate-900 border rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none disabled:opacity-60 ${
          error ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
        }`}
      />
      {error ? <p id={errorId} className="text-[11px] text-rose-400 mt-1">{error}</p> : null}
    </div>
  );
}

export default function AppFixReportForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'create',
}) {
  const { role } = useRoleAccess();
  const [formData, setFormData] = useState(createEmptyAppFixReportFormData());
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressByIndex, setUploadProgressByIndex] = useState({});
  const isSubmittingRef = useRef(false);

  const isEditing = mode === 'edit' && Boolean(initialData?.id);
  const moduleOptions = getAppFixAffectedModuleOptions(role);
  const showCustomCategory = formData.category === APP_FIX_CATEGORY.OTHER;
  const canEditCurrentRequest = !isEditing || canUserEditRequestByStatus(initialData);

  useEffect(() => {
    if (!isOpen) {
      setFormData(createEmptyAppFixReportFormData());
      setAttachmentFiles([]);
      setFieldErrors({});
      setFormError('');
      setUploadProgressByIndex({});
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

    setFormData(mapAppFixRequestToFormData(initialData));
    setAttachmentFiles([]);
    setFieldErrors({});
    setFormError('');
    setUploadProgressByIndex({});
    setIsSubmitting(false);
    isSubmittingRef.current = false;
  }, [initialData, isOpen, mode]);

  const updateField = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmittingRef.current || !canEditCurrentRequest) return;

    const errors = getAppFixRequestValidationErrors(formData);
    const attachmentErrors = attachmentFiles
      .map((file, index) => ({ index, message: validateAppFixAttachmentFile(file) }))
      .filter((entry) => entry.message);

    if (attachmentErrors.length) {
      errors.attachments = attachmentErrors[0].message;
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setFormError('Please fix the highlighted fields before submitting.');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setFormError('');

    try {
      await onSubmit({
        formData,
        attachmentFiles,
        onFileProgress: (fileIndex, progress) => {
          setUploadProgressByIndex((previous) => ({
            ...previous,
            [fileIndex]: progress,
          }));
        },
      });
      onClose();
    } catch (error) {
      setFormError(getAppFixErrorMessage(error, 'The request could not be saved. Please try again.'));
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Update Request' : 'Report a Problem'}
      icon={Bug}
      maxWidth="max-w-2xl"
      panelClassName="p-4 space-y-4"
      preventClose={isSubmitting}
    >
      {!canEditCurrentRequest ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-3 text-xs text-amber-300">
          This request can only be edited while it is Open or Waiting for User.
        </div>
      ) : null}

      {formError ? (
        <div role="alert" className="rounded-lg border border-rose-500/20 bg-rose-950/30 p-3 text-xs text-rose-400">
          {formError}
        </div>
      ) : null}

      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Request Title"
          value={formData.title}
          onChange={(event) => updateField('title', event.target.value)}
          error={fieldErrors.title}
          required
          disabled={!canEditCurrentRequest || isSubmitting}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={formData.category}
            onChange={(event) => updateField('category', event.target.value)}
            options={APP_FIX_CATEGORY_OPTIONS}
            error={fieldErrors.category}
            required
            disabled={!canEditCurrentRequest || isSubmitting}
          />
          <Select
            label="Affected Module"
            value={formData.affectedModule}
            onChange={(event) => updateField('affectedModule', event.target.value)}
            options={moduleOptions}
            error={fieldErrors.affectedModule}
            required
            disabled={!canEditCurrentRequest || isSubmitting}
          />
        </div>

        {showCustomCategory ? (
          <Input
            label="Custom Category"
            value={formData.customCategory}
            onChange={(event) => updateField('customCategory', event.target.value)}
            error={fieldErrors.customCategory}
            required
            disabled={!canEditCurrentRequest || isSubmitting}
          />
        ) : null}

        <Select
          label="Priority"
          value={formData.priority}
          onChange={(event) => updateField('priority', event.target.value)}
          options={APP_FIX_PRIORITY_OPTIONS}
          error={fieldErrors.priority}
          required
          disabled={!canEditCurrentRequest || isSubmitting}
        />

        <TextAreaField
          label="Description"
          value={formData.description}
          onChange={(event) => updateField('description', event.target.value)}
          error={fieldErrors.description}
          required
          rows={4}
        />

        <TextAreaField
          label="Steps to Reproduce"
          value={formData.stepsToReproduce}
          onChange={(event) => updateField('stepsToReproduce', event.target.value)}
          error={fieldErrors.stepsToReproduce}
          rows={3}
        />

        <TextAreaField
          label="Error Message"
          value={formData.errorMessage}
          onChange={(event) => updateField('errorMessage', event.target.value)}
          error={fieldErrors.errorMessage}
          rows={2}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Device Type"
            value={formData.deviceType}
            onChange={(event) => updateField('deviceType', event.target.value)}
            options={APP_FIX_DEVICE_TYPE_OPTIONS}
            error={fieldErrors.deviceType}
            disabled={!canEditCurrentRequest || isSubmitting}
          />
          <Select
            label="Browser/App Mode"
            value={formData.browserMode}
            onChange={(event) => updateField('browserMode', event.target.value)}
            options={APP_FIX_BROWSER_MODE_OPTIONS}
            error={fieldErrors.browserMode}
            disabled={!canEditCurrentRequest || isSubmitting}
          />
        </div>

        <AppFixAttachmentUploadField
          files={attachmentFiles}
          onChange={setAttachmentFiles}
          disabled={!canEditCurrentRequest || isSubmitting}
          uploadProgressByIndex={uploadProgressByIndex}
        />
        {fieldErrors.attachments ? (
          <p className="text-[11px] text-rose-400">{fieldErrors.attachments}</p>
        ) : null}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            isLoading={isSubmitting}
            disabled={!canEditCurrentRequest}
          >
            {isEditing ? 'Save Changes' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

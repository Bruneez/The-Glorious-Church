import { useEffect, useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProjectAttachmentUploadField from '@/components/features/projects/ProjectAttachmentUploadField';
import { getProjectErrorMessage } from '@/config/projectsOptions';

function TextAreaField({
  label,
  name,
  value,
  onChange,
  required = false,
  rows = 4,
  error = '',
  placeholder = '',
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
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs resize-y min-h-[6rem] ${error ? 'border-rose-500' : ''}`}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-rose-400 text-[10px] mt-1">{error}</p>
      ) : null}
    </div>
  );
}

export default function AddUpdateModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const [message, setMessage] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    setMessage('');
    setAttachmentFiles([]);
    setFieldErrors({});
    setSubmitError('');
    setIsSubmitting(false);
    setUploadProgress(0);
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    const attachmentFile = attachmentFiles[0] || null;

    if (!trimmedMessage && !attachmentFile) {
      setFieldErrors({ message: 'Enter an update or choose an attachment.' });
      return;
    }

    setFieldErrors({});
    setSubmitError('');
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      await onSubmit({
        message: trimmedMessage,
        attachmentFile,
        onAttachmentProgress: setUploadProgress,
      });
      onClose();
    } catch (submitFailure) {
      setSubmitError(getProjectErrorMessage(submitFailure, 'Failed to add update. Please try again.'));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Project Update"
      icon={MessageSquarePlus}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextAreaField
          label="Update"
          name="message"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setFieldErrors((current) => ({ ...current, message: '' }));
          }}
          placeholder="Share progress, notes, or next steps..."
          error={fieldErrors.message}
        />

        <ProjectAttachmentUploadField
          files={attachmentFiles}
          onChange={setAttachmentFiles}
          disabled={isSubmitting}
          uploadProgressByIndex={{ 0: uploadProgress }}
        />

        {submitError ? (
          <p role="alert" className="text-rose-400 text-xs">{submitError}</p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Update'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

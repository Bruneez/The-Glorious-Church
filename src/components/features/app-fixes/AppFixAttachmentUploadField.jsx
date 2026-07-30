import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { FileText, Film, Paperclip, Upload, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import {
  ACCEPTED_APP_FIX_ATTACHMENT_ACCEPT,
  validateAppFixAttachmentFile,
} from '@/config/appFixesAttachmentOptions';
import { isImageAttachment, isPdfAttachment, isVideoAttachment } from '@/config/appFixesDisplay';

function createPendingAttachment(file) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: String(file.type || '').startsWith('image/') ? URL.createObjectURL(file) : '',
    error: validateAppFixAttachmentFile(file),
    uploadProgress: 0,
  };
}

function AttachmentPreviewIcon({ file }) {
  if (String(file.type || '').startsWith('image/')) {
    return null;
  }
  if (String(file.type || '').startsWith('video/')) {
    return <Film className="w-5 h-5 text-indigo-300" aria-hidden="true" />;
  }
  if (String(file.type || '') === 'application/pdf') {
    return <FileText className="w-5 h-5 text-rose-300" aria-hidden="true" />;
  }
  return <Paperclip className="w-5 h-5 text-slate-400" aria-hidden="true" />;
}

export default function AppFixAttachmentUploadField({
  files = [],
  onChange,
  disabled = false,
  uploadProgressByIndex = {},
  helperText = 'JPG, PNG, WEBP, PDF, MP4, WEBM, or MOV files.',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();
  const fileInputRef = useRef(null);
  const pendingItems = useMemo(
    () => files.map((file, index) => ({
      ...createPendingAttachment(file),
      uploadProgress: uploadProgressByIndex[index] ?? 0,
    })),
    [files, uploadProgressByIndex],
  );

  useEffect(() => () => {
    pendingItems.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  }, [pendingItems]);

  const addFiles = useCallback((incomingFiles = []) => {
    if (disabled || !incomingFiles.length) return;
    onChange?.([...files, ...Array.from(incomingFiles)]);
  }, [disabled, files, onChange]);

  const removeFile = (index) => {
    if (disabled) return;
    onChange?.(files.filter((_, fileIndex) => fileIndex !== index));
  };

  const openFilePicker = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-slate-400 mb-1 font-medium text-xs">Attachments</label>
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        multiple
        accept={ACCEPTED_APP_FIX_ATTACHMENT_ACCEPT}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <div
        className={`rounded-lg border bg-slate-900 p-3 space-y-3 transition ${
          isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700'
        } ${disabled ? 'opacity-60' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsDragging(false);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-white">Add screenshots, logs, or screen recordings</p>
            <p id={`${inputId}-helper`} className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            icon={Upload}
            onClick={openFilePicker}
            disabled={disabled}
            className="shrink-0 w-full sm:w-auto"
            aria-describedby={`${inputId}-helper`}
          >
            Choose Files
          </Button>
        </div>

        {pendingItems.length ? (
          <ul className="space-y-2">
            {pendingItems.map((item, index) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-700/80 bg-slate-950/40 p-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-md border border-slate-700 bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.previewUrl ? (
                      <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <AttachmentPreviewIcon file={item.file} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white truncate">{item.file.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {item.error ? (
                      <p className="text-[11px] text-rose-400 mt-1">{item.error}</p>
                    ) : null}

                    {item.uploadProgress > 0 && item.uploadProgress < 100 ? (
                      <div className="mt-2">
                        <div
                          className="h-1.5 rounded-full bg-slate-800 overflow-hidden"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={item.uploadProgress}
                          aria-label={`Uploading ${item.file.name}`}
                        >
                          <div
                            className="h-full bg-indigo-500 transition-all"
                            style={{ width: `${item.uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Uploading… {item.uploadProgress}%</p>
                      </div>
                    ) : null}
                  </div>

                  {!disabled ? (
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-slate-500 hover:text-white shrink-0"
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export function isExistingAttachmentPreviewable(attachment = {}) {
  return isImageAttachment(attachment) || isVideoAttachment(attachment) || isPdfAttachment(attachment);
}

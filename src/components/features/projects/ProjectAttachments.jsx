import { useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  FileText,
  ImageOff,
  Loader2,
  Trash2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import ProjectAttachmentUploadField from '@/components/features/projects/ProjectAttachmentUploadField';
import { ProjectDetailSection } from '@/components/features/projects/ProjectDetailField';
import {
  formatProjectAttachmentSize,
  formatProjectTimelineDate,
  isProjectImageAttachment,
  isProjectPdfAttachment,
} from '@/config/projectsDisplay';
import { canDeleteProjectAttachment } from '@/services/projectGuards';

function AttachmentPreview({ attachment }) {
  const [hasError, setHasError] = useState(false);

  if (isProjectImageAttachment(attachment) && attachment.fileUrl && !hasError) {
    return (
      <img
        src={attachment.fileUrl}
        alt={attachment.fileName || 'Attachment preview'}
        loading="lazy"
        onError={() => setHasError(true)}
        className="mt-3 rounded-md border border-slate-700 max-h-48 w-full object-contain bg-slate-950"
      />
    );
  }

  if (isProjectImageAttachment(attachment) && hasError) {
    return (
      <div className="mt-3 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-4 flex items-center gap-3">
        <ImageOff className="h-8 w-8 text-slate-500 shrink-0" aria-hidden="true" />
        <p className="text-[11px] text-slate-400">Image preview unavailable.</p>
      </div>
    );
  }

  if (isProjectPdfAttachment(attachment)) {
    return (
      <div className="mt-3 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-4 flex items-center gap-3">
        <FileText className="h-8 w-8 text-rose-300 shrink-0" aria-hidden="true" />
        <p className="text-[11px] text-slate-400">
          PDF preview is available after download.
        </p>
      </div>
    );
  }

  return null;
}

function AttachmentCard({
  attachment,
  canDelete = false,
  deleting = false,
  onDelete,
}) {
  return (
    <li className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-3.5 space-y-2 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between min-w-0">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {attachment.fileName || 'Untitled file'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {formatProjectAttachmentSize(attachment.fileSizeBytes)}
            {' · '}
            {formatProjectTimelineDate(attachment.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {attachment.fileUrl ? (
            <>
              <a
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700/70 bg-slate-800/80 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:text-white transition"
              >
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                Open
              </a>
              <a
                href={attachment.fileUrl}
                download={attachment.fileName || true}
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 text-[10px] font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
              >
                <Download className="h-3 w-3" aria-hidden="true" />
                Download
              </a>
            </>
          ) : null}

          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete?.(attachment)}
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-70"
            >
              {deleting ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="h-3 w-3" aria-hidden="true" />
              )}
              Delete
            </button>
          ) : null}
        </div>
      </div>

      <AttachmentPreview attachment={attachment} />
    </li>
  );
}

export default function ProjectAttachments({
  project,
  attachments = [],
  userId = '',
  role = '',
  membership = null,
  canUpload = false,
  onUpload,
  onDelete,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const sortedAttachments = useMemo(
    () => [...attachments].sort((left, right) => {
      const leftTime = left.createdAt?.toDate?.()?.getTime?.() || Date.parse(left.createdAt || 0);
      const rightTime = right.createdAt?.toDate?.()?.getTime?.() || Date.parse(right.createdAt || 0);
      return rightTime - leftTime;
    }),
    [attachments],
  );

  const handleUpload = async () => {
    const file = selectedFiles[0];
    if (!file || !onUpload) return;

    setUploadError('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      await onUpload(file, (progress) => setUploadProgress(progress));
      setSelectedFiles([]);
      setUploadProgress(0);
    } catch (error) {
      setUploadError(error?.message || 'Failed to upload attachment.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachment) => {
    if (!onDelete || !attachment?.id) return;

    setDeletingId(attachment.id);

    try {
      await onDelete(attachment);
    } finally {
      setDeletingId('');
    }
  };

  return (
    <ProjectDetailSection title="Attachments">
      {canUpload ? (
        <div className="space-y-3">
          <ProjectAttachmentUploadField
            files={selectedFiles}
            onChange={setSelectedFiles}
            disabled={isUploading}
            uploadProgressByIndex={{ 0: uploadProgress }}
          />

          {uploadError ? (
            <p role="alert" className="text-rose-400 text-xs">{uploadError}</p>
          ) : null}

          {selectedFiles.length ? (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full sm:w-auto"
            >
              {isUploading ? 'Uploading...' : 'Upload Attachment'}
            </Button>
          ) : null}
        </div>
      ) : null}

      {sortedAttachments.length ? (
        <ul className="space-y-3">
          {sortedAttachments.map((attachment) => (
            <AttachmentCard
              key={attachment.id}
              attachment={attachment}
              canDelete={canDeleteProjectAttachment(role, project, attachment, userId, membership)}
              deleting={deletingId === attachment.id}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-900/30 px-4 py-8 text-center">
          <p className="text-xs text-slate-500">No attachments uploaded yet.</p>
        </div>
      )}
    </ProjectDetailSection>
  );
}

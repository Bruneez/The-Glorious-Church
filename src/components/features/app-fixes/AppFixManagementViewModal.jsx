import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bug,
  Copy,
  ExternalLink,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import {
  APP_FIX_CATEGORY,
  APP_FIX_CATEGORY_OPTIONS,
  APP_FIX_PRIORITY_OPTIONS,
  APP_FIX_STATUS_OPTIONS,
} from '@/config/appFixesConstants';
import {
  APP_FIX_MANAGEMENT_ACTIONS,
  getAssignableStaffOptions,
} from '@/config/appFixesManagementOptions';
import {
  getAppFixAffectedModuleDisplay,
  getAppFixBrowserModeLabel,
  getAppFixCategoryLabel,
  getAppFixDeviceTypeLabel,
  getAppFixPriorityLabel,
  getAppFixRequestReferenceNumber,
  getAppFixRequestSubmittedAt,
  getAppFixRequestUpdatedAt,
  getAppFixStatusLabel,
  getAppFixStatusToneClass,
  getAppFixUpdateTimelineLabel,
  formatAppFixUpdateTimestamp,
  isImageAttachment,
  isPdfAttachment,
  isVideoAttachment,
} from '@/config/appFixesDisplay';
import { APP_FIX_AFFECTED_MODULE_OPTIONS } from '@/config/appFixesOptions';
import { getAppFixErrorMessage } from '@/config/appFixesErrorMessages';
import AppFixDetailLoadingSkeleton from '@/components/features/app-fixes/AppFixDetailLoadingSkeleton';
import {
  addManagementComment,
  applyManagementAction,
  deleteRequest,
  duplicateRequest,
  updateManagementRequest,
  useAppFixRequestDetails,
} from '@/services/appFixesService';

function DetailField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-xs text-slate-200 mt-1 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows = 3, disabled = false, id }) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      <label htmlFor={fieldId} className="block text-slate-400 mb-1.5 font-medium text-xs">{label}</label>
      <textarea
        id={fieldId}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
      />
    </div>
  );
}

function AttachmentList({ attachments = [] }) {
  if (!attachments.length) {
    return <p className="text-xs text-slate-500">No attachments uploaded.</p>;
  }

  return (
    <ul className="space-y-2">
      {attachments.map((attachment) => (
        <li key={attachment.id} className="rounded-lg border border-slate-700/70 bg-slate-900/50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-white truncate">{attachment.fileName}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{attachment.contentType}</p>
            </div>
            {attachment.fileUrl ? (
              <a
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200 shrink-0"
              >
                Open
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : null}
          </div>
          {isImageAttachment(attachment) && attachment.fileUrl ? (
            <img src={attachment.fileUrl} alt={attachment.fileName} className="mt-3 rounded-md border border-slate-700 max-h-48 w-full object-contain bg-slate-950" />
          ) : null}
          {isVideoAttachment(attachment) && attachment.fileUrl ? (
            <video controls src={attachment.fileUrl} className="mt-3 rounded-md border border-slate-700 max-h-48 w-full bg-slate-950" />
          ) : null}
          {isPdfAttachment(attachment) ? (
            <p className="text-[11px] text-slate-400 mt-2">PDF attachment available via Open link.</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function AppFixManagementViewModal({
  request,
  isOpen,
  onClose,
  onSaved,
  onDeleted,
  onDuplicated,
  staff = [],
  role,
  createdByUserId,
  createdByName,
  actorStaffId = '',
}) {
  const requestId = request?.id || '';
  const { updates, attachments, loading, error: detailsError } = useAppFixRequestDetails(requestId, {
    enabled: isOpen && Boolean(requestId),
  });

  const [formData, setFormData] = useState({});
  const [userComment, setUserComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [error, setError] = useState('');
  const isBusyRef = useRef(false);

  const isBusy = isSaving || isDeleting || isPostingComment;

  const assignableStaff = useMemo(() => getAssignableStaffOptions(staff), [staff]);
  const moduleOptions = useMemo(() => APP_FIX_AFFECTED_MODULE_OPTIONS, []);

  useEffect(() => {
    if (!isOpen || !request) return;

    setFormData({
      status: request.status || '',
      priority: request.priority || '',
      category: request.category || '',
      customCategory: request.customCategory || '',
      affectedModule: request.affectedModule || '',
      assignedToUserId: request.assignedToUserId || '',
      assignedToName: request.assignedToName || '',
      internalNotes: request.internalNotes || '',
      developerNotes: request.developerNotes || '',
      resolutionSummary: request.resolutionSummary || '',
    });
    setUserComment('');
    setError('');
  }, [isOpen, request]);

  const timelineItems = useMemo(
    () => [...updates].sort((left, right) => {
      const leftTime = left.createdAt?.toDate?.()?.getTime?.() || Date.parse(left.createdAt || 0) || 0;
      const rightTime = right.createdAt?.toDate?.()?.getTime?.() || Date.parse(right.createdAt || 0) || 0;
      return rightTime - leftTime;
    }),
    [updates],
  );

  const updateField = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleAssignChange = (event) => {
    const nextUserId = event.target.value;
    const assignee = assignableStaff.find((option) => option.value === nextUserId);
    updateField('assignedToUserId', nextUserId);
    updateField('assignedToName', assignee?.label || '');
  };

  const handleSave = async () => {
    if (!request?.id || isBusyRef.current) return;

    isBusyRef.current = true;
    setIsSaving(true);
    setError('');

    try {
      await updateManagementRequest(request.id, formData, {
        role,
        createdByUserId,
        initialData: request,
        createdByName,
        actorStaffId,
      });
      onSaved?.('Request updated successfully.');
      onClose();
    } catch (saveError) {
      setError(getAppFixErrorMessage(saveError, 'Failed to save request.'));
    } finally {
      isBusyRef.current = false;
      setIsSaving(false);
    }
  };

  const handleAction = async (actionKey) => {
    if (!request?.id || isBusyRef.current) return;

    isBusyRef.current = true;
    setIsSaving(true);
    setError('');

    try {
      await applyManagementAction(request.id, actionKey, {
        role,
        createdByUserId,
        initialData: request,
        createdByName,
        actorStaffId,
      });
      onSaved?.('Request updated successfully.');
      onClose();
    } catch (actionError) {
      setError(getAppFixErrorMessage(actionError, 'Failed to apply action.'));
    } finally {
      isBusyRef.current = false;
      setIsSaving(false);
    }
  };

  const handleUserComment = async () => {
    if (!request?.id || !userComment.trim() || isBusyRef.current) return;

    isBusyRef.current = true;
    setIsPostingComment(true);
    setError('');

    try {
      await addManagementComment(
        request.id,
        { message: userComment.trim(), isInternal: false },
        { role, createdByUserId, createdByName },
      );
      setUserComment('');
      onSaved?.('User update posted.');
    } catch (commentError) {
      setError(getAppFixErrorMessage(commentError, 'Failed to post update.'));
    } finally {
      isBusyRef.current = false;
      setIsPostingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!request?.id || isBusyRef.current) return;

    const confirmed = window.confirm(
      'Delete this request permanently? This action cannot be undone.',
    );
    if (!confirmed) return;

    isBusyRef.current = true;
    setIsDeleting(true);
    setError('');

    try {
      await deleteRequest(request.id, { role, createdByUserId, initialData: request });
      onDeleted?.('Request deleted successfully.');
      onClose();
    } catch (deleteError) {
      setError(getAppFixErrorMessage(deleteError, 'Failed to delete request.'));
    } finally {
      isBusyRef.current = false;
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!request?.id || isBusyRef.current) return;

    isBusyRef.current = true;
    setIsSaving(true);
    setError('');

    try {
      const result = await duplicateRequest(request.id, {
        role,
        createdByUserId,
        createdByName,
        actorStaffId,
      });
      onDuplicated?.('Request duplicated successfully.', result.request);
      onClose();
    } catch (duplicateError) {
      setError(getAppFixErrorMessage(duplicateError, 'Failed to duplicate request.'));
    } finally {
      isBusyRef.current = false;
      setIsSaving(false);
    }
  };

  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={request.title}
      icon={Bug}
      maxWidth="max-w-4xl"
      panelClassName="p-4 space-y-4"
      preventClose={isBusy}
    >
      {error ? (
        <div role="alert" className="rounded-lg border border-rose-500/20 bg-rose-950/30 p-3 text-xs text-rose-400">
          {error}
        </div>
      ) : null}

      {detailsError ? (
        <div role="alert" className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-3 text-xs text-amber-300">
          {getAppFixErrorMessage(detailsError, 'Failed to load request details. Please try again.')}
        </div>
      ) : null}

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <p className="text-[11px] text-slate-500">{getAppFixRequestReferenceNumber(request)}</p>
          <span className={`inline-flex mt-2 px-2 py-0.5 rounded-full border text-[10px] font-medium ${getAppFixStatusToneClass(request.status)}`}>
            {getAppFixStatusLabel(request.status)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(APP_FIX_MANAGEMENT_ACTIONS).map(([actionKey, action]) => (
            <Button
              key={actionKey}
              type="button"
              variant="secondary"
              onClick={() => handleAction(actionKey)}
              disabled={isBusy}
            >
              {action.label}
            </Button>
          ))}
          <Button type="button" variant="outline" icon={Copy} onClick={handleDuplicate} disabled={isBusy}>
            Duplicate
          </Button>
          <Button type="button" variant="danger" icon={Trash2} onClick={handleDelete} isLoading={isDeleting} disabled={isBusy}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
        <span>Submitted: {getAppFixRequestSubmittedAt(request)}</span>
        <span>Updated: {getAppFixRequestUpdatedAt(request)}</span>
        <span>Submitted by: {request.createdByName || 'Unknown user'}</span>
        <span>Module: {getAppFixAffectedModuleDisplay(request)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Status"
          value={formData.status || ''}
          onChange={(event) => updateField('status', event.target.value)}
          options={APP_FIX_STATUS_OPTIONS}
        />
        <Select
          label="Priority"
          value={formData.priority || ''}
          onChange={(event) => updateField('priority', event.target.value)}
          options={APP_FIX_PRIORITY_OPTIONS}
        />
        <Select
          label="Category"
          value={formData.category || ''}
          onChange={(event) => updateField('category', event.target.value)}
          options={APP_FIX_CATEGORY_OPTIONS}
        />
        <Select
          label="Affected Module"
          value={formData.affectedModule || ''}
          onChange={(event) => updateField('affectedModule', event.target.value)}
          options={moduleOptions}
        />
        <Select
          label="Assign Person"
          value={formData.assignedToUserId || ''}
          onChange={handleAssignChange}
          options={[{ value: '', label: 'Unassigned' }, ...assignableStaff]}
          placeholder="Unassigned"
        />
      </div>

      {formData.category === APP_FIX_CATEGORY.OTHER ? (
        <Input
          label="Custom Category"
          value={formData.customCategory || ''}
          onChange={(event) => updateField('customCategory', event.target.value)}
        />
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextAreaField
          label="Internal Notes"
          value={formData.internalNotes || ''}
          onChange={(event) => updateField('internalNotes', event.target.value)}
          disabled={isBusy}
        />
        <TextAreaField
          label="Developer Notes"
          value={formData.developerNotes || ''}
          onChange={(event) => updateField('developerNotes', event.target.value)}
          disabled={isBusy}
        />
      </div>

      <TextAreaField
        label="Resolution Summary"
        value={formData.resolutionSummary || ''}
        onChange={(event) => updateField('resolutionSummary', event.target.value)}
        rows={4}
        disabled={isBusy}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField label="Description" value={request.description} />
        <DetailField label="Steps to Reproduce" value={request.stepsToReproduce} />
        <DetailField label="Error Message" value={request.errorMessage} />
        <DetailField label="Device Type" value={getAppFixDeviceTypeLabel(request.deviceType)} />
        <DetailField label="Browser/App Mode" value={getAppFixBrowserModeLabel(request.browserMode)} />
        <DetailField label="Category" value={getAppFixCategoryLabel(request)} />
        <DetailField label="Priority" value={getAppFixPriorityLabel(request.priority)} />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white mb-2">Post User Update</h4>
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="app-fix-user-update" className="sr-only">User update message</label>
          <input
            id="app-fix-user-update"
            type="text"
            value={userComment}
            onChange={(event) => setUserComment(event.target.value)}
            placeholder="Message visible to the submitting user..."
            disabled={isBusy}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
          />
          <Button
            type="button"
            onClick={handleUserComment}
            isLoading={isPostingComment}
            disabled={isBusy || !userComment.trim()}
          >
            Post Update
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white mb-3">Timeline</h4>
        {loading ? (
          <AppFixDetailLoadingSkeleton />
        ) : timelineItems.length ? (
          <ol className="space-y-3">
            {timelineItems.map((update) => (
              <li
                key={update.id}
                className={`rounded-lg border p-3 ${
                  update.isInternal
                    ? 'border-amber-500/20 bg-amber-950/20'
                    : 'border-slate-700/70 bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-white">
                    {getAppFixUpdateTimelineLabel(update)}
                    {update.isInternal ? ' (Internal)' : ''}
                  </p>
                  <p className="text-[11px] text-slate-500 shrink-0">
                    {formatAppFixUpdateTimestamp(update)}
                  </p>
                </div>
                <p className="text-xs text-slate-300 mt-2 whitespace-pre-wrap">{update.message}</p>
                {update.createdByName ? (
                  <p className="text-[11px] text-slate-500 mt-2">{update.createdByName}</p>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-slate-500">No timeline entries yet.</p>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white mb-3">Attachments</h4>
        {loading ? (
          <AppFixDetailLoadingSkeleton />
        ) : (
          <AttachmentList attachments={attachments} />
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
          Close
        </Button>
        <Button type="button" icon={RefreshCw} onClick={handleSave} isLoading={isSaving} disabled={isBusy}>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}

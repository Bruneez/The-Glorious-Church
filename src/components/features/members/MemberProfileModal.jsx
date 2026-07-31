import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';
import MemberCard from '@/components/features/members/MemberCard';
import MemberForm from '@/components/features/members/MemberForm';
import { COLLECTIONS } from '@/config/collections';
import { useDocument } from '@/hooks/useFirestore';
import { useMemberManagementAccess } from '@/hooks/useMemberManagementAccess';
import { deleteMember, updateMember } from '@/services/membersService';
import { normalizeMemberResponse } from '@/services/memberResponseUtils';

function MemberProfileLoadingModal({ nested = false, onClose }) {
  const zIndexClass = nested ? 'z-[80]' : 'z-[70]';

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} overflow-y-auto overscroll-contain bg-slate-900/60 backdrop-blur-sm`}
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-label="Loading member profile"
    >
      <div className="flex min-h-[100vh] min-h-[100dvh] w-full items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-700">Loading member profile...</p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function MemberProfileErrorModal({ nested = false, message, onClose }) {
  const zIndexClass = nested ? 'z-[80]' : 'z-[70]';

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} overflow-y-auto overscroll-contain bg-slate-900/60 backdrop-blur-sm`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Member profile error"
    >
      <div className="flex min-h-[100vh] min-h-[100dvh] w-full items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Member Profile</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-5 py-6">
            <p className="text-sm text-rose-700">{message}</p>
          </div>
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function MemberProfileModal({
  memberId = null,
  isOpen = false,
  onClose,
  nested = false,
  onEdit,
  onDelete,
  onUpdated,
  onDeleted,
  lockCreativeArtsDepartmentName = '',
}) {
  const activeMemberId = isOpen ? String(memberId || '').trim() : '';
  const { data: member, loading, error } = useDocument(COLLECTIONS.MEMBERS, activeMemberId || null);
  const { canManageMember } = useMemberManagementAccess();
  const [editingMember, setEditingMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setEditingMember(null);
      setActionError('');
      setIsSubmitting(false);
    }
  }, [isOpen, activeMemberId]);

  if (!isOpen || !activeMemberId) {
    return null;
  }

  const normalizedMember = member ? normalizeMemberResponse(member) : null;
  const canManage = normalizedMember ? canManageMember(normalizedMember) : false;

  const handleClose = () => {
    if (isSubmitting) return;
    onClose?.();
  };

  const handleEdit = (selectedMember) => {
    if (onEdit) {
      onEdit(selectedMember);
      return;
    }

    setEditingMember(selectedMember);
  };

  const handleDelete = async (selectedMember) => {
    if (onDelete) {
      await onDelete(selectedMember);
      onClose?.();
      return;
    }

    setIsSubmitting(true);
    setActionError('');

    try {
      const result = await deleteMember(selectedMember.id);
      onDeleted?.(result, selectedMember);
      onClose?.();
    } catch (deleteError) {
      console.error('Failed to delete member from profile modal:', deleteError);
      setActionError(deleteError?.message || 'Failed to delete member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    if (!editingMember?.id) return;

    setIsSubmitting(true);
    setActionError('');

    try {
      const result = await updateMember(editingMember.id, formData);
      onUpdated?.(result, editingMember);
      setEditingMember(null);
    } catch (updateError) {
      console.error('Failed to update member from profile modal:', updateError);
      setActionError(updateError?.message || 'Failed to update member. Please try again.');
      throw updateError;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <MemberProfileLoadingModal nested={nested} onClose={handleClose} />;
  }

  if (error) {
    return (
      <MemberProfileErrorModal
        nested={nested}
        message="Failed to load this member profile. Please try again."
        onClose={handleClose}
      />
    );
  }

  if (!normalizedMember) {
    return (
      <MemberProfileErrorModal
        nested={nested}
        message="This member could not be found. They may have been removed from the directory."
        onClose={handleClose}
      />
    );
  }

  return (
    <>
      {actionError ? (
        <MemberProfileErrorModal
          nested={nested}
          message={actionError}
          onClose={() => setActionError('')}
        />
      ) : null}

      {editingMember && !onEdit ? (
        <MemberForm
          isOpen
          onClose={() => setEditingMember(null)}
          onSubmit={handleFormSubmit}
          initialData={editingMember}
          lockCreativeArtsDepartmentName={lockCreativeArtsDepartmentName}
        />
      ) : (
        <MemberCard
          member={normalizedMember}
          isOpen
          nested={nested}
          onClose={handleClose}
          onEdit={canManage ? handleEdit : undefined}
          onDelete={canManage ? handleDelete : undefined}
          canManage={canManage}
        />
      )}
    </>
  );
}

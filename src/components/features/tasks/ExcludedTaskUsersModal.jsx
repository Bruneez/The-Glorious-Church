import { useEffect, useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar';
import { getRoleLabel } from '@/config/roles';

function ExcludedUserRow({ member, onRestore, isProcessing }) {
  const name = member.fullName || member.name || 'Unknown';

  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
      <UserAvatar name={name} photo={member.photo} size="md" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{name}</p>
        {member.role ? (
          <p className="text-[11px] text-indigo-400/90 font-medium mt-0.5">
            {getRoleLabel(member.role)}
          </p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => onRestore(member)}
        disabled={isProcessing}
        className="shrink-0"
      >
        Restore
      </Button>
    </div>
  );
}

export default function ExcludedTaskUsersModal({
  excludedStaff = [],
  isOpen,
  onClose,
  onRestore,
  isProcessing = false,
}) {
  const [confirmingMember, setConfirmingMember] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setConfirmingMember(null);
    setError('');
  }, [isOpen]);

  const handleRestoreConfirm = async () => {
    if (!confirmingMember) return;

    setError('');

    try {
      await onRestore(confirmingMember);
      setConfirmingMember(null);
    } catch (restoreError) {
      setError(restoreError?.message || 'Failed to restore user to Tasks.');
    }
  };

  const confirmingName = confirmingMember?.fullName || confirmingMember?.name || 'this user';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={confirmingMember ? 'Restore User' : 'Excluded Users'}
      icon={confirmingMember ? UserPlus : Users}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {confirmingMember ? (
          <>
            <p className="text-slate-300 text-xs leading-relaxed">
              Restore <span className="font-semibold text-white">{confirmingName}</span> to the
              Tasks module? They will reappear in the task overview and assignment dropdowns. Their
              system account and existing task history will remain unchanged.
            </p>

            {error ? <p className="text-rose-400 text-[11px]">{error}</p> : null}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setConfirmingMember(null);
                  setError('');
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleRestoreConfirm}
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                Restore to Tasks
              </Button>
            </div>
          </>
        ) : excludedStaff.length === 0 ? (
          <p className="text-slate-400 text-xs leading-relaxed">
            No staff users are currently excluded from the Tasks module.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-slate-400 text-xs leading-relaxed">
              These staff users were removed from the Tasks module. Restoring them will not change
              their system account or login access.
            </p>

            {excludedStaff.map((member) => (
              <ExcludedUserRow
                key={member.id}
                member={member}
                onRestore={setConfirmingMember}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}

        {!confirmingMember ? (
          <div className="flex justify-end pt-2 border-t border-slate-700">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

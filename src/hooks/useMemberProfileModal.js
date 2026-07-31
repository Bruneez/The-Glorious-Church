import { useCallback, useState } from 'react';

export function useMemberProfileModal() {
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openMemberProfile = useCallback((memberId) => {
    const id = String(memberId || '').trim();
    if (!id) {
      console.warn('[useMemberProfileModal] Cannot open a member profile without a member ID.');
      return false;
    }

    setSelectedMemberId(id);
    setIsOpen(true);
    return true;
  }, []);

  const closeMemberProfile = useCallback(() => {
    setIsOpen(false);
    setSelectedMemberId(null);
  }, []);

  return {
    selectedMemberId,
    isOpen,
    openMemberProfile,
    closeMemberProfile,
  };
}

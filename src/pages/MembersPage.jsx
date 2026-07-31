import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import MemberFilters from '@/components/features/members/MemberFilters';
import MembersTable from '@/components/features/members/MembersTable';
import MembersMobileList from '@/components/features/members/MembersMobileList';
import MemberForm from '@/components/features/members/MemberForm';
import MemberProfileModal from '@/components/features/members/MemberProfileModal';
import {
  useMembers,
  createMember,
  updateMember,
  deleteMember,
  filterMembers,
} from '@/services/membersService';
import { useCreativeArts } from '@/services/creativeArtsService';
import { useMinistries } from '@/services/ministriesService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useMemberManagementAccess } from '@/hooks/useMemberManagementAccess';
import { useAuth } from '@/hooks/useAuth';
import { ROLES, normalizeRole, isChurchWideStaff, isCALeader } from '@/config/roles';
import {
  MEMBER_STATUS,
  inferMemberChurch,
  memberBelongsToDepartment,
} from '@/config/memberOptions';
import {
  resolveMemberTableSort,
  sortMembersTable,
} from '@/config/memberTableOptions';
function FeedbackBanner({ feedback, onDismiss }) {
  if (!feedback?.message) return null;

  const styles = {
    success: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/10 border border-amber-500/20 text-amber-300',
    error: 'bg-rose-500/10 border border-rose-500/20 text-rose-400',
  };

  return (
    <div
      className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between gap-3 ${
        styles[feedback.type] || styles.error
      }`}
    >
      <span>{feedback.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-current hover:opacity-80 shrink-0"
      >
        Dismiss
      </button>
    </div>
  );
}

export default function MembersPage() {
  const { data: members = [], loading, error } = useMembers();
  const { data: creativeArtsTeams = [] } = useCreativeArts();
  const { data: ministries = [] } = useMinistries();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useRoleAccess();
  const { staffDocId, firebaseUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChurch, setFilterChurch] = useState('all');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMemberId, setViewingMemberId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const memberId = searchParams.get('memberId');
    if (!memberId || loading) return;

    if (!members.some((item) => item.id === memberId)) return;

    setViewingMemberId(memberId);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('memberId');
    setSearchParams(nextParams, { replace: true });
  }, [loading, members, searchParams, setSearchParams]);

  const normalizedRole = normalizeRole(role);
  const isChurchWideUser = isChurchWideStaff(normalizedRole);
  const isCALeaderUser = normalizedRole === ROLES.LEADER;
  const { canManageMembers, canManageMember, creatorDepartment } = useMemberManagementAccess();

  const scopedMembers = useMemo(() => {
    if (isChurchWideUser) return members;
    if (isCALeaderUser && creatorDepartment) {
      return members.filter((member) => memberBelongsToDepartment(member, creatorDepartment));
    }
    return members;
  }, [members, isChurchWideUser, isCALeaderUser, creatorDepartment]);

  const filteredMembers = useMemo(() => {
    let filtered = filterMembers(scopedMembers, searchTerm);

    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        (member) => (member.status || MEMBER_STATUS.ACTIVE) === filterStatus,
      );
    }

    if (filterChurch !== 'all') {
      filtered = filtered.filter(
        (member) => inferMemberChurch(member) === filterChurch,
      );
    }

    const { column, direction } = resolveMemberTableSort(sortColumn, sortDirection);
    return sortMembersTable(filtered, column, direction, { creativeArtsTeams, ministries });
  }, [
    scopedMembers,
    searchTerm,
    filterStatus,
    filterChurch,
    sortColumn,
    sortDirection,
    creativeArtsTeams,
    ministries,
  ]);

  const handleSortChange = useCallback((column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
  }, []);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  const handleAddMember = () => {
    if (isCALeaderUser && !creatorDepartment) {
      showFeedback(
        'error',
        'Your staff profile does not have a department assigned. Contact an administrator.',
      );
      return;
    }

    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member) => {
    if (!canManageMember(member)) return;
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleViewMember = (member) => {
    if (!member?.id) return;
    setViewingMemberId(member.id);
  };

  const handleProfileEdit = (member) => {
    setViewingMemberId(null);
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleProfileDelete = async (member) => {
    const memberId = member?.id;
    if (!memberId || !canManageMember(member)) return;

    try {
      const { storageWarnings = [] } = await deleteMember(memberId);

      if (storageWarnings.length) {
        showFeedback(
          'warning',
          `Member deleted successfully. ${storageWarnings.join(' ')}`,
        );
      } else {
        showFeedback('success', 'Member deleted successfully.');
      }
    } catch (deleteError) {
      console.error('Error deleting member:', deleteError);
      showFeedback('error', 'Failed to delete member. Please try again.');
      throw deleteError;
    }
  };

  const createdBy = staffDocId || firebaseUser?.uid || '';

  const handleFormSubmit = async (formData) => {
    try {
      if (editingMember) {
        const { storageWarnings = [] } = await updateMember(editingMember.id, formData);

        if (storageWarnings.length) {
          showFeedback(
            'warning',
            `Member updated successfully. ${storageWarnings.join(' ')}`,
          );
        } else {
          showFeedback('success', 'Member updated successfully.');
        }
      } else {
        await createMember(formData, createdBy);
        showFeedback('success', 'Member added successfully.');
      }

      setIsFormOpen(false);
      setEditingMember(null);
    } catch (saveError) {
      console.error('Error saving member:', saveError);
      showFeedback('error', saveError?.message || 'Failed to save member. Please try again.');
      throw saveError;
    }
  };

  const handleDeleteMember = async (member) => {
    if (!canManageMember(member)) return;

    const memberId = typeof member === 'string' ? member : member.id;
    const memberName =
      typeof member === 'string'
        ? 'this member'
        : `${member.name} ${member.surname}`.trim();

    if (!window.confirm(`Delete ${memberName}? This cannot be undone.`)) {
      return;
    }

    try {
      const { storageWarnings = [] } = await deleteMember(memberId);

      if (storageWarnings.length) {
        showFeedback(
          'warning',
          `Member deleted successfully. ${storageWarnings.join(' ')}`,
        );
      } else {
        showFeedback('success', 'Member deleted successfully.');
      }
    } catch (deleteError) {
      console.error('Error deleting member:', deleteError);
      showFeedback('error', 'Failed to delete member. Please try again.');
    }
  };

  return (
    <div className="page-root">
      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

      {isCALeaderUser && creatorDepartment && (
        <p className="text-[11px] text-slate-400">
          Viewing members in your department:{' '}
          <span className="font-semibold text-slate-200">{creatorDepartment}</span>
        </p>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700/70 bg-slate-800/40">
          <MemberFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterChurch={filterChurch}
            onFilterChurchChange={setFilterChurch}
            onAddMember={canManageMembers ? handleAddMember : undefined}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-rose-400 text-xs">Failed to load members. Please refresh and try again.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block p-4 pt-0">
              <MembersTable
                members={filteredMembers}
                onView={handleViewMember}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
                canManageRow={canManageMember}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                creativeArtsTeams={creativeArtsTeams}
                ministries={ministries}
              />
            </div>

            <div className="p-4 pt-0">
              <MembersMobileList
                members={filteredMembers}
                onView={handleViewMember}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
                canManageRow={canManageMember}
                creativeArtsTeams={creativeArtsTeams}
                ministries={ministries}
              />
            </div>
          </>
        )}
      </div>

      {canManageMembers && (
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <button
            type="button"
            onClick={handleAddMember}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg"
            aria-label="Add Member"
          >
            <UserPlus className="w-6 h-6" />
          </button>
        </div>
      )}

      <MemberForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMember(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingMember}
        lockCreativeArtsDepartmentName={isCALeaderUser ? creatorDepartment : ''}
      />

      <MemberProfileModal
        memberId={viewingMemberId}
        isOpen={Boolean(viewingMemberId)}
        onClose={() => setViewingMemberId(null)}
        onEdit={handleProfileEdit}
        onDelete={handleProfileDelete}
        lockCreativeArtsDepartmentName={isCALeaderUser ? creatorDepartment : ''}
      />
    </div>
  );
}

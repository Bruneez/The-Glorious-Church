import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import MemberFilters from '@/components/features/members/MemberFilters';
import MembersTable from '@/components/features/members/MembersTable';
import MembersMobileList from '@/components/features/members/MembersMobileList';
import MemberForm from '@/components/features/members/MemberForm';
import MemberCard from '@/components/features/members/MemberCard';
import {
  useMembers,
  createMember,
  updateMember,
  deleteMember,
  filterMembers,
} from '@/services/membersService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/hooks/useAuth';
import { ROLES, normalizeRole } from '@/config/roles';
import {
  MEMBER_STATUS,
  getMemberDepartment,
  getStaffDepartment,
  memberBelongsToDepartment,
} from '@/config/memberOptions';

function FeedbackBanner({ feedback, onDismiss }) {
  if (!feedback?.message) return null;

  const isSuccess = feedback.type === 'success';

  return (
    <div
      className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between gap-3 ${
        isSuccess
          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { role, canPerformAction } = useRoleAccess();
  const { staffProfile, staffDocId, firebaseUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const memberId = searchParams.get('memberId');
    if (!memberId || loading) return;

    const member = members.find((item) => item.id === memberId);
    if (!member) return;

    setViewingMember(member);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('memberId');
    setSearchParams(nextParams, { replace: true });
  }, [loading, members, searchParams, setSearchParams]);

  const normalizedRole = normalizeRole(role);
  const isAdminOrPastor =
    normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.PASTOR;
  const isCALeader = normalizedRole === ROLES.CA_LEADER;
  const creatorDepartment = getStaffDepartment(staffProfile);
  const canManageMembers =
    canPerformAction('MANAGE_MEMBERS') || isCALeader;

  const scopedMembers = useMemo(() => {
    if (isAdminOrPastor) return members;
    if (isCALeader && creatorDepartment) {
      return members.filter((member) => memberBelongsToDepartment(member, creatorDepartment));
    }
    return members;
  }, [members, isAdminOrPastor, isCALeader, creatorDepartment]);

  const canManageMember = (member) => {
    if (!canManageMembers) return false;
    if (isAdminOrPastor) return true;
    if (isCALeader && creatorDepartment) {
      return memberBelongsToDepartment(member, creatorDepartment);
    }
    return false;
  };

  const filteredMembers = useMemo(() => {
    let filtered = filterMembers(scopedMembers, searchTerm);

    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        (member) => (member.status || MEMBER_STATUS.ACTIVE) === filterStatus,
      );
    }

    filtered.sort((a, b) => {
      const nameA = `${a.name || ''} ${a.surname || ''}`.trim().toLowerCase();
      const nameB = `${b.name || ''} ${b.surname || ''}`.trim().toLowerCase();
      if (sortDirection === 'asc') {
        return nameA.localeCompare(nameB);
      }
      return nameB.localeCompare(nameA);
    });

    return filtered;
  }, [scopedMembers, searchTerm, filterStatus, sortDirection]);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  const handleAddMember = () => {
    if (isCALeader && !creatorDepartment) {
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
    setViewingMember(member);
  };

  const createdBy = staffDocId || firebaseUser?.uid || '';

  const handleFormSubmit = async (formData) => {
    try {
      if (editingMember) {
        await updateMember(editingMember.id, {
          ...formData,
          department: getMemberDepartment(editingMember),
        });
        showFeedback('success', 'Member updated successfully.');
      } else {
        await createMember(
          {
            ...formData,
            department: creatorDepartment,
          },
          createdBy,
        );
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
      await deleteMember(memberId);
      showFeedback('success', 'Member deleted successfully.');
    } catch (deleteError) {
      console.error('Error deleting member:', deleteError);
      showFeedback('error', 'Failed to delete member. Please try again.');
    }
  };

  return (
    <div className="page-root">
      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

      {isCALeader && creatorDepartment && (
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
            onSortToggle={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            sortDirection={sortDirection}
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
              />
            </div>

            <div className="p-4 pt-0">
              <MembersMobileList
                members={filteredMembers}
                onView={handleViewMember}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
                canManageRow={canManageMember}
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
      />

      {viewingMember && (
        <MemberCard
          member={viewingMember}
          isOpen={!!viewingMember}
          onClose={() => setViewingMember(null)}
          onEdit={canManageMember(viewingMember) ? handleEditMember : undefined}
          onDelete={canManageMember(viewingMember) ? handleDeleteMember : undefined}
          canManage={canManageMember(viewingMember)}
        />
      )}
    </div>
  );
}

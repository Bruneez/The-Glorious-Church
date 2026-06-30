import { useState, useMemo } from 'react';
import { UserPlus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import MemberFilters from '@/components/features/members/MemberFilters';
import MembersTable from '@/components/features/members/MembersTable';
import MemberForm from '@/components/features/members/MemberForm';
import MemberCard from '@/components/features/members/MemberCard';
import { useMembers, createMember, updateMember, deleteMember } from '@/services/membersService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import RoleGate from '@/components/auth/RoleGate';

export default function MembersPage() {
  const { data: members = [], loading } = useMembers();
  const { canPerformAction } = useRoleAccess();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);

  const filteredMembers = useMemo(() => {
    let filtered = [...members];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(term) ||
        member.phone?.toLowerCase().includes(term) ||
        member.address?.toLowerCase().includes(term)
      );
    }

    if (filterDept !== 'all') {
      filtered = filtered.filter(member => member.creativeArts === filterDept);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(member => member.status === filterStatus);
    }

    filtered.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      if (sortDirection === 'asc') {
        return nameA.localeCompare(nameB);
      }
      return nameB.localeCompare(nameA);
    });

    return filtered;
  }, [members, searchTerm, filterDept, filterStatus, sortDirection]);

  const handleAddMember = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setViewingMember(member);
  };

  const handleViewMember = (member) => {
    setViewingMember(member);
    setEditingMember(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingMember) {
        await updateMember(editingMember.id, formData);
      } else {
        await createMember(formData);
      }
      setIsFormOpen(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save member. Please try again.');
    }
  };

  const handleUpdateMember = async (memberId, formData) => {
    try {
      await updateMember(memberId, formData);
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member. Please try again.');
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      await deleteMember(memberId);
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member. Please try again.');
    }
  };

  const canManageMembers = canPerformAction('MANAGE_MEMBERS');

  return (
    <div className="space-y-6">
      <PageHeader title="Youth Roster Core Directory" badge="Active Congregation" />

      <Card>
        <MemberFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterDept={filterDept}
          onFilterDeptChange={setFilterDept}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          onSortToggle={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          sortDirection={sortDirection}
          onAddMember={canManageMembers ? handleAddMember : undefined}
        />

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <MembersTable
            members={filteredMembers}
            onEdit={canManageMembers ? handleEditMember : handleViewMember}
            onDelete={canManageMembers ? handleDeleteMember : undefined}
          />
        )}
      </Card>

      {/* Mobile Add Member Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <RoleGate allowedAction="MANAGE_MEMBERS">
          <button
            onClick={handleAddMember}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg"
          >
            <UserPlus className="w-6 h-6" />
          </button>
        </RoleGate>
      </div>

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
          onClose={() => {
            setViewingMember(null);
            setEditingMember(null);
          }}
          onUpdate={canManageMembers ? handleUpdateMember : undefined}
          onDelete={canManageMembers ? handleDeleteMember : undefined}
        />
      )}
    </div>
  );
}

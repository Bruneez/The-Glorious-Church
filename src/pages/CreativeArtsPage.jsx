import { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import CreativeArtsForm from '@/components/features/creative-arts/CreativeArtsForm';
import CreativeArtsCard from '@/components/features/creative-arts/CreativeArtsCard';
import { useCreativeArts, createCreativeArtsTeam, updateCreativeArtsTeam, deleteCreativeArtsTeam } from '@/services/creativeArtsService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import RoleGate from '@/components/auth/RoleGate';

export default function CreativeArtsPage() {
  const { data: groups = [], loading } = useCreativeArts();
  const { canPerformAction } = useRoleAccess();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const handleAddGroup = () => {
    setEditingGroup(null);
    setIsFormOpen(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingGroup) {
        await updateCreativeArtsTeam(editingGroup.id, formData);
      } else {
        await createCreativeArtsTeam(formData);
      }
      setIsFormOpen(false);
      setEditingGroup(null);
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Failed to save group. Please try again.');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteCreativeArtsTeam(groupId);
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group. Please try again.');
    }
  };

  const canManageEvents = canPerformAction('MANAGE_EVENTS');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Creative Arts Sectors"
        subtitle="Our Ministries: Find your place. Discover your calling. Be part of a movement changing lives for Jesus. (Colossians 3:16)"
        action={
          canManageEvents ? (
            <Button icon={Plus} onClick={handleAddGroup}>
              Add Custom Group
            </Button>
          ) : null
        }
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-8 text-center">
          <p className="text-slate-500 text-xs">No creative arts groups found</p>
          {canManageEvents && (
            <Button icon={Plus} onClick={handleAddGroup} className="mt-4">
              Add Your First Group
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => (
            <CreativeArtsCard
              key={group.id}
              group={group}
              onEdit={canManageEvents ? handleEditGroup : undefined}
              onDelete={canManageEvents ? handleDeleteGroup : undefined}
            />
          ))}
        </div>
      )}

      {/* Mobile Add Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <RoleGate allowedAction="MANAGE_EVENTS">
          <button
            onClick={handleAddGroup}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </button>
        </RoleGate>
      </div>

      <CreativeArtsForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingGroup(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingGroup}
      />
    </div>
  );
}

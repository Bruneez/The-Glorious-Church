import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import SchoolForm from '@/components/features/schools/SchoolForm';
import SchoolCard from '@/components/features/schools/SchoolCard';
import { useSchools, createSchool, updateSchool, deleteSchool } from '@/services/schoolsService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import RoleGate from '@/components/auth/RoleGate';

export default function HigherEducationPage() {
  const { data: schools = [], loading } = useSchools('higher-education');
  const { canPerformAction } = useRoleAccess();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);

  const handleAddSchool = () => {
    setEditingSchool(null);
    setIsFormOpen(true);
  };

  const handleEditSchool = (school) => {
    setEditingSchool(school);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingSchool) {
        await updateSchool(editingSchool.id, formData);
      } else {
        await createSchool(formData);
      }
      setIsFormOpen(false);
      setEditingSchool(null);
    } catch (error) {
      console.error('Error saving school:', error);
      alert('Failed to save school. Please try again.');
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    try {
      await deleteSchool(schoolId);
    } catch (error) {
      console.error('Error deleting school:', error);
      alert('Failed to delete school. Please try again.');
    }
  };

  const canManageSchools = canPerformAction('MANAGE_SCHOOLS');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Universities & Colleges Allocation Roster"
        action={
          canManageSchools ? (
            <Button icon={Plus} onClick={handleAddSchool}>
              Add University/College
            </Button>
          ) : null
        }
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : schools.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-8 text-center">
          <p className="text-slate-500 text-xs">No universities or colleges found</p>
          {canManageSchools && (
            <Button icon={Plus} onClick={handleAddSchool} className="mt-4">
              Add Your First Institution
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map(school => (
            <SchoolCard
              key={school.id}
              school={school}
              onEdit={canManageSchools ? handleEditSchool : undefined}
              onDelete={canManageSchools ? handleDeleteSchool : undefined}
            />
          ))}
        </div>
      )}

      {/* Mobile Add Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <RoleGate allowedAction="MANAGE_SCHOOLS">
          <button
            onClick={handleAddSchool}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </button>
        </RoleGate>
      </div>

      <SchoolForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSchool(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingSchool}
        schoolType="higher-education"
      />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import SchoolsForm from '@/components/features/schools/SchoolsForm';
import SchoolsViewModal from '@/components/features/schools/SchoolsViewModal';
import SchoolsCardGrid from '@/components/features/schools/SchoolsCardGrid';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/services/membersService';
import {
  useSchoolsDirectory,
  createSchoolRecord,
  updateSchoolRecord,
  deleteSchoolRecord,
} from '@/services/schoolsService';
import {
  computeLearnerStatsByOccupation,
  computeMemberCountsBySchool,
  mapSchoolForTable,
  SCHOOL_TYPE,
} from '@/config/schoolsOptions';

const SCHOOL_CATEGORIES = [
  {
    id: SCHOOL_TYPE.PRIMARY,
    label: 'Primary Schools',
    description: 'Primary school roster and member allocation.',
    emptyMessage: 'No primary schools found.',
  },
  {
    id: SCHOOL_TYPE.HIGH,
    label: 'High Schools',
    description: 'High school roster and member allocation.',
    emptyMessage: 'No high schools found.',
  },
  {
    id: SCHOOL_TYPE.HIGHER_EDUCATION,
    label: 'Universities & Colleges',
    description: 'University and college roster and member allocation.',
    emptyMessage: 'No universities or colleges found.',
  },
];

const SUMMARY_CARDS = [
  { label: 'Total Primary School Learners', key: 'primary' },
  { label: 'Total High School Learners', key: 'high' },
  { label: 'Total University / College Students', key: 'university' },
];

function SummaryCard({ label, value }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/70 shadow-sm">
      <h3 className="text-2xl md:text-3xl font-bold text-indigo-400">{value}</h3>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
        {label}
      </p>
    </div>
  );
}

export default function SchoolsPage() {
  const { data: schools = [], loading: schoolsLoading } = useSchoolsDirectory();
  const { data: members = [], loading: membersLoading } = useMembers();
  const { canPerformAction } = useRoleAccess();
  const { staffProfile, firebaseUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState(SCHOOL_TYPE.PRIMARY);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [viewingSchool, setViewingSchool] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const canManageSchools = canPerformAction('MANAGE_SCHOOLS');
  const canEditDeleteSchools = canPerformAction('EDIT_DELETE_SCHOOLS');

  const memberCounts = useMemo(
    () => computeMemberCountsBySchool(members, schools),
    [members, schools],
  );

  const learnerStats = useMemo(
    () => computeLearnerStatsByOccupation(members),
    [members],
  );

  const schoolsByCategory = useMemo(
    () => SCHOOL_CATEGORIES.reduce((groups, category) => {
      groups[category.id] = schools
        .filter((school) => school.schoolType === category.id)
        .map((school) => mapSchoolForTable(school, memberCounts));
      return groups;
    }, {}),
    [schools, memberCounts],
  );

  const getCreatedByName = () =>
    staffProfile?.name || firebaseUser?.displayName || firebaseUser?.email || 'Staff Member';

  const handleAddSchool = () => {
    setFeedback({ type: '', message: '' });
    setEditingSchool(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingSchool?.id) {
      await updateSchoolRecord(editingSchool.id, formData, editingSchool);
      setFeedback({ type: 'success', message: 'School updated successfully.' });
    } else {
      await createSchoolRecord(formData, getCreatedByName());
      setFeedback({ type: 'success', message: 'School saved successfully.' });
    }

    setIsFormOpen(false);
    setEditingSchool(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSchool(null);
  };

  const handleViewSchool = (tableSchool) => {
    setViewingSchool(tableSchool?.raw || null);
  };

  const handleEditSchool = (tableSchool) => {
    if (!canManageSchools) return;
    setFeedback({ type: '', message: '' });
    setEditingSchool(tableSchool?.raw || null);
    setIsFormOpen(true);
  };

  const handleDeleteSchool = async (tableSchool) => {
    if (!canEditDeleteSchools || !tableSchool?.id) return;

    const confirmed = window.confirm(
      `Delete ${tableSchool.schoolName}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteSchoolRecord(tableSchool.id);
      setFeedback({ type: 'success', message: 'School deleted successfully.' });
    } catch (error) {
      console.error('Error deleting school:', error);
      setFeedback({ type: 'error', message: 'Failed to delete school. Please try again.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Schools</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage all schools attended by church members.
          </p>
        </div>
        {canManageSchools && (
          <Button icon={Plus} onClick={handleAddSchool} className="shrink-0 w-full sm:w-auto">
            Add School
          </Button>
        )}
      </div>

      {feedback.message && (
        <div
          className={`p-3 rounded-lg text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUMMARY_CARDS.map((card) => (
          <SummaryCard
            key={card.label}
            label={card.label}
            value={membersLoading ? '—' : learnerStats[card.key]}
          />
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm">
        <div
          className="flex overflow-x-auto border-b border-slate-700/70"
          role="tablist"
          aria-label="School categories"
        >
          {SCHOOL_CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`schools-panel-${category.id}`}
                id={`schools-tab-${category.id}`}
                onClick={() => setActiveCategory(category.id)}
                className={`shrink-0 px-4 py-3 text-xs font-semibold transition border-b-2 ${
                  isActive
                    ? 'text-white border-indigo-500 bg-indigo-600/10'
                    : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-700/40'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {SCHOOL_CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id;
          const categorySchools = schoolsByCategory[category.id] || [];

          return (
            <div
              key={category.id}
              id={`schools-panel-${category.id}`}
              role="tabpanel"
              aria-labelledby={`schools-tab-${category.id}`}
              hidden={!isActive}
              className={isActive ? 'block' : 'hidden'}
            >
              <div className="p-4 border-b border-slate-700/70 bg-slate-800/40">
                <h2 className="text-sm font-bold text-white tracking-wide">{category.label}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{category.description}</p>
              </div>

              <div className="p-4 md:p-5">
                {schoolsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                  </div>
                ) : (
                  <SchoolsCardGrid
                    schools={categorySchools}
                    onView={handleViewSchool}
                    onEdit={canManageSchools ? handleEditSchool : undefined}
                    onDelete={canEditDeleteSchools ? handleDeleteSchool : undefined}
                    canEdit={canManageSchools}
                    canDelete={canEditDeleteSchools}
                    emptyMessage={category.emptyMessage}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {canManageSchools && (
        <SchoolsForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          initialData={editingSchool}
          defaultType={activeCategory}
        />
      )}

      <SchoolsViewModal
        school={viewingSchool}
        members={members}
        isOpen={Boolean(viewingSchool)}
        onClose={() => setViewingSchool(null)}
      />
    </div>
  );
}

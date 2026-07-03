import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import CreativeArtsForm from '@/components/features/creative-arts/CreativeArtsForm';
import CreativeArtsTable from '@/components/features/creative-arts/CreativeArtsTable';
import CreativeArtsMobileList from '@/components/features/creative-arts/CreativeArtsMobileList';
import CreativeArtsViewModal from '@/components/features/creative-arts/CreativeArtsViewModal';
import {
  useCreativeArts,
  createCreativeArtsTeam,
  updateCreativeArtsTeam,
  deleteCreativeArtsTeam,
  seedDefaultDepartmentsIfEmpty,
} from '@/services/creativeArtsService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import RoleGate from '@/components/auth/RoleGate';
import { computeCreativeArtsStats, filterDepartments } from '@/config/creativeArtsOptions';

function SummaryCard({ label, value, loading }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/70 shadow-sm">
      <h3 className="text-2xl md:text-3xl font-bold text-indigo-400">
        {loading ? '—' : value}
      </h3>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
        {label}
      </p>
    </div>
  );
}

export default function CreativeArtsPage() {
  const { data: departments = [], loading } = useCreativeArts();
  const { canPerformAction } = useRoleAccess();
  const seedAttempted = useRef(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [viewingDepartment, setViewingDepartment] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const canManage = canPerformAction('MANAGE_EVENTS');

  const stats = useMemo(
    () => computeCreativeArtsStats(departments),
    [departments],
  );

  const filteredDepartments = useMemo(
    () => filterDepartments(departments, searchTerm),
    [departments, searchTerm],
  );

  useEffect(() => {
    if (loading || seedAttempted.current || departments.length > 0) {
      return;
    }

    seedAttempted.current = true;
    seedDefaultDepartmentsIfEmpty().catch(() => {
      seedAttempted.current = false;
    });
  }, [loading, departments.length]);

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setIsFormOpen(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setIsFormOpen(true);
  };

  const handleViewDepartment = (department) => {
    setViewingDepartment(department);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingDepartment) {
        await updateCreativeArtsTeam(editingDepartment.id, formData, editingDepartment);
        setFeedback({ type: 'success', message: 'Department updated successfully.' });
      } else {
        await createCreativeArtsTeam(formData);
        setFeedback({ type: 'success', message: 'Department added successfully.' });
      }

      setIsFormOpen(false);
      setEditingDepartment(null);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to save department. Please try again.' });
      throw error;
    }
  };

  const handleDeleteDepartment = async (department) => {
    const departmentId = typeof department === 'string' ? department : department.id;
    const departmentName = typeof department === 'string' ? 'this department' : department.name;

    if (!window.confirm(`Delete ${departmentName}? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteCreativeArtsTeam(departmentId);
      setFeedback({ type: 'success', message: 'Department deleted successfully.' });
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to delete department. Please try again.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Creative Arts</h1>
          <p className="text-sm text-slate-400 mt-1">Manage all Creative Arts departments.</p>
        </div>
        {canManage && (
          <Button icon={Plus} onClick={handleAddDepartment} className="shrink-0">
            Add Department
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Total Departments"
          value={stats.totalDepartments}
          loading={loading}
        />
        <SummaryCard
          label="Total Members"
          value={stats.totalMembers}
          loading={loading}
        />
        <SummaryCard
          label="Active Departments"
          value={stats.activeDepartments}
          loading={loading}
        />
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700/70 bg-slate-800/40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search department name, leader, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <>
            <div className="hidden md:block p-4 pt-0">
              <CreativeArtsTable
                departments={filteredDepartments}
                onView={handleViewDepartment}
                onEdit={canManage ? handleEditDepartment : undefined}
                onDelete={canManage ? handleDeleteDepartment : undefined}
                canManageRow={() => canManage}
              />
            </div>

            <div className="p-4 pt-0 md:hidden">
              <CreativeArtsMobileList
                departments={filteredDepartments}
                onView={handleViewDepartment}
                onEdit={canManage ? handleEditDepartment : undefined}
                onDelete={canManage ? handleDeleteDepartment : undefined}
                canManageRow={() => canManage}
              />
            </div>
          </>
        )}
      </div>

      {canManage && (
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <RoleGate allowedAction="MANAGE_EVENTS">
            <button
              type="button"
              onClick={handleAddDepartment}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg"
              aria-label="Add Department"
            >
              <Plus className="w-6 h-6" />
            </button>
          </RoleGate>
        </div>
      )}

      <CreativeArtsForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDepartment(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingDepartment}
      />

      {viewingDepartment && (
        <CreativeArtsViewModal
          department={viewingDepartment}
          isOpen={!!viewingDepartment}
          onClose={() => setViewingDepartment(null)}
          onEdit={canManage ? handleEditDepartment : undefined}
          onDelete={canManage ? handleDeleteDepartment : undefined}
          canManage={canManage}
        />
      )}
    </div>
  );
}

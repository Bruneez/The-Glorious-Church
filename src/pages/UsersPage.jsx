import { useState, useMemo, useEffect, useCallback } from 'react';
import { UserPlus, Search, Eye, Edit2, Trash2 } from 'lucide-react';
import UserForm from '@/components/features/users/UserForm';
import UserViewModal from '@/components/features/users/UserViewModal';
import StaffSummaryCards from '@/components/features/users/StaffSummaryCards';
import Table from '@/components/ui/Table';
import TableColumnSortControls from '@/components/ui/TableColumnSortControls';
import Button from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar';
import { useCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/config/collections';
import { updateDocument, deleteDocument } from '@/hooks/useFirestore';
import { createStaffUser } from '@/services/staffUserService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import RoleBadge from '@/components/ui/RoleBadge';
import { ROLE_LIST, normalizeRole } from '@/config/roles';
import { prepareStaffTableRows } from '@/config/staffOptions';
import { formatLastSeen, isUserOnline } from '@/utils/lastSeen';

function LastSeenCell({ value }) {
  const label = formatLastSeen(value);
  const online = isUserOnline(value);

  return (
    <span className={`inline-flex items-center gap-1.5 ${online ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
      {online && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />}
      {label}
    </span>
  );
}

function SortableHeader({ label, columnKey, activeColumn, activeDirection, onSort, ascendingLabel, descendingLabel }) {
  return (
    <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap">
      <span className="leading-tight">{label}</span>
      <TableColumnSortControls
        columnKey={columnKey}
        activeColumn={activeColumn}
        activeDirection={activeDirection}
        onSort={onSort}
        ascendingLabel={ascendingLabel}
        descendingLabel={descendingLabel}
        className="ml-0.5"
      />
    </span>
  );
}

export default function UsersPage() {
  const { data: staff = [], loading } = useCollection(COLLECTIONS.STAFF);
  const { role: currentUserRole, canPerformAction } = useRoleAccess();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!saveMessage) return undefined;
    const timer = setTimeout(() => setSaveMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [saveMessage]);

  const handleSortChange = useCallback((column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
  }, []);

  const filteredStaff = useMemo(
    () =>
      prepareStaffTableRows(staff, {
        searchTerm,
        filterRole,
        sortColumn,
        sortDirection,
      }),
    [staff, searchTerm, filterRole, sortColumn, sortDirection],
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
  };

  const handleFormSubmit = async (formData) => {
    const staffData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: normalizeRole(formData.role),
      phone: formData.phone,
      photo: formData.photo || '',
    };

    if (editingUser) {
      await updateDocument(COLLECTIONS.STAFF, editingUser.id, {
        ...staffData,
        fullName: staffData.name,
      });
      setSaveMessage('Staff member updated successfully.');
    } else {
      await createStaffUser({
        ...staffData,
        password: formData.password,
      });
      setSaveMessage('Staff user created successfully.');
    }

    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDocument(COLLECTIONS.STAFF, userId);
    } catch (error) {
      console.error('Error deleting staff member:', error);
      alert('Failed to delete staff member. Please try again.');
    }
  };

  const canManageStaff = canPerformAction('MANAGE_STAFF');
  const canCreateInitialStaff = staff.length === 0 && !currentUserRole;
  const canManageStaffOrBootstrap = canManageStaff || canCreateInitialStaff;
  const showPermissionNote = !canManageStaff && !canCreateInitialStaff && currentUserRole;

  const columns = [
    {
      key: 'avatar',
      label: 'Avatar',
      className: 'w-[72px]',
      cellClassName: 'py-4',
      render: (value, row) => (
        <UserAvatar
          name={row.fullName || row.name}
          photo={row.photo}
          size="sm"
        />
      ),
    },
    {
      key: 'name',
      label: 'Staff Member Name',
      className: 'whitespace-nowrap min-w-[12rem]',
      cellClassName: 'py-4 font-medium text-slate-100',
      headerRender: () => (
        <SortableHeader
          label="Staff Member Name"
          columnKey="name"
          activeColumn={sortColumn}
          activeDirection={sortDirection}
          onSort={handleSortChange}
          ascendingLabel="Sort staff member name ascending"
          descendingLabel="Sort staff member name descending"
        />
      ),
      render: (value, row) => row.fullName || row.name || '—',
    },
    {
      key: 'email',
      label: 'Secure Log Email',
      className: 'whitespace-nowrap min-w-[11rem]',
      cellClassName: 'py-4',
      headerRender: () => (
        <SortableHeader
          label="Secure Log Email"
          columnKey="email"
          activeColumn={sortColumn}
          activeDirection={sortDirection}
          onSort={handleSortChange}
          ascendingLabel="Sort secure login email ascending"
          descendingLabel="Sort secure login email descending"
        />
      ),
    },
    {
      key: 'role',
      label: 'Assigned Portal Role',
      className: 'whitespace-nowrap min-w-[12rem]',
      cellClassName: 'py-4',
      headerRender: () => (
        <SortableHeader
          label="Assigned Portal Role"
          columnKey="role"
          activeColumn={sortColumn}
          activeDirection={sortDirection}
          onSort={handleSortChange}
          ascendingLabel="Sort role ascending"
          descendingLabel="Sort role descending"
        />
      ),
      render: (value) => <RoleBadge role={value} />,
    },
    {
      key: 'lastSeenAt',
      label: 'Last Seen',
      className: 'whitespace-nowrap min-w-[10rem]',
      cellClassName: 'py-4',
      headerRender: () => (
        <SortableHeader
          label="Last Seen"
          columnKey="lastSeenAt"
          activeColumn={sortColumn}
          activeDirection={sortDirection}
          onSort={handleSortChange}
          ascendingLabel="Sort last seen ascending"
          descendingLabel="Sort last seen descending"
        />
      ),
      render: (value) => <LastSeenCell value={value} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      cellClassName: 'py-4',
      render: (value, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleViewUser(row)}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/30 transition"
            title="View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {canManageStaff && (
            <>
              <button
                onClick={() => handleEditUser(row)}
                className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-indigo-500/10 transition"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteUser(row.id)}
                className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-root">
      <div className="space-y-2">
        <p className="text-[11px] text-slate-400">
          Signed in as:{' '}
          <span className="font-semibold text-slate-100">
            {currentUserRole || 'Unassigned Staff Role'}
          </span>
        </p>
      </div>

      {saveMessage && (
        <p className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 rounded-lg px-3 py-2">
          {saveMessage}
        </p>
      )}

      <StaffSummaryCards staff={staff} loading={loading} />

      <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-700/70 bg-slate-800/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Staff Controls
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1 min-w-0">
              <label htmlFor="staff-search" className="block text-slate-400 mb-1 font-medium text-xs">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  id="staff-search"
                  type="text"
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="w-full md:w-56 shrink-0">
              <label htmlFor="staff-role-filter" className="block text-slate-400 mb-1 font-medium text-xs">
                Role Filter
              </label>
              <select
                id="staff-role-filter"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Roles</option>
                {ROLE_LIST.map((role) => (
                  <option key={role} value={role}>
                    {role} Only
                  </option>
                ))}
              </select>
            </div>

            {canManageStaffOrBootstrap && (
              <div className="shrink-0 md:pb-0">
                <span className="block text-xs font-medium text-transparent mb-1 select-none md:invisible">
                  Action
                </span>
                <Button icon={UserPlus} onClick={handleAddUser} className="w-full md:w-auto">
                  Add User
                </Button>
              </div>
            )}
          </div>

          {showPermissionNote && (
            <p className="text-[11px] text-slate-400">
              Add user access is reserved for Admin or Pastor accounts. Please login with an admin
              account or ask your administrator to assign you the correct role.
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredStaff}
            emptyMessage="No staff members found"
            className="rounded-none border-0 shadow-none"
          />
        )}
      </div>

      <UserForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
      />

      <UserViewModal
        user={viewingUser}
        staffDirectory={staff}
        isOpen={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
      />
    </div>
  );
}

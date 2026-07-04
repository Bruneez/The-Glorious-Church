import { useState, useMemo, useEffect } from 'react';
import { UserPlus, Search, Eye, Edit2, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import UserForm from '@/components/features/users/UserForm';
import UserViewModal from '@/components/features/users/UserViewModal';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { useCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/config/collections';
import { updateDocument, deleteDocument } from '@/hooks/useFirestore';
import { createStaffUser } from '@/services/staffUserService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { ROLES } from '@/config/roles';
import { getInitials } from '@/utils/formatters';

export default function UsersPage() {
  const { data: staff = [], loading } = useCollection(COLLECTIONS.STAFF);
  const { role: currentUserRole, canPerformAction } = useRoleAccess();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!saveMessage) return undefined;
    const timer = setTimeout(() => setSaveMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [saveMessage]);

  const filteredStaff = useMemo(() => {
    let filtered = [...staff];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(term) ||
        member.email?.toLowerCase().includes(term)
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(member => member.role === filterRole);
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
  }, [staff, searchTerm, filterRole, sortDirection]);

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
      role: formData.role,
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
      className: 'w-[60px]',
      render: (value, row) => (
        <div className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-400/30 flex items-center justify-center text-xs font-bold uppercase text-white">
          {row.photo ? (
            <img src={row.photo} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(row.name)
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Staff Member Name'
    },
    {
      key: 'email',
      label: 'Secure Log Email'
    },
    {
      key: 'role',
      label: 'Assigned Portal Role',
      render: (value) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          value === ROLES.ADMIN 
            ? 'bg-rose-950/60 text-rose-400 border border-rose-500/20' 
            : value === ROLES.PASTOR
            ? 'bg-amber-950/60 text-amber-400 border border-amber-500/20'
            : 'bg-blue-950/60 text-blue-400 border border-blue-500/20'
        }`}>
          {value || 'Unknown'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (value, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleViewUser(row)}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-700/30 transition"
            title="View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {canManageStaff && (
            <>
              <button
                onClick={() => handleEditUser(row)}
                className="text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-indigo-500/10 transition"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteUser(row.id)}
                className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Staff Access Control Directory"
        badge="Administrative Node"
      />

      <p className="text-[11px] text-slate-400">
        Signed in as: <span className="font-semibold text-slate-100">{currentUserRole || 'Unassigned Staff Role'}</span>
      </p>

      {saveMessage && (
        <p className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 rounded-lg px-3 py-2">
          {saveMessage}
        </p>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700/70 bg-slate-800/40 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Staff Controls</span>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="bg-slate-900 text-[11px] text-slate-300 px-2.5 py-1.5 border border-slate-700 rounded-lg hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              Sort Name: A-Z ({sortDirection === 'asc' ? 'Asc' : 'Desc'})
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Administrative Roles</option>
              <option value={ROLES.ADMIN}>Admin Only</option>
              <option value={ROLES.PASTOR}>Pastors Only</option>
              <option value={ROLES.CA_LEADER}>Creative Arts Leaders</option>
            </select>

            {canManageStaffOrBootstrap && (
              <Button icon={UserPlus} onClick={handleAddUser}>
                Add User
              </Button>
            )}
          </div>
          {showPermissionNote && (
            <p className="text-[11px] text-slate-400 mt-2">
              Add user access is reserved for Admin or Pastor accounts. Please login with an admin account or ask your administrator to assign you the correct role.
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredStaff}
            emptyMessage="No staff members found"
            className="bg-transparent"
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

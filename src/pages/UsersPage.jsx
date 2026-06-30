import { useState, useMemo } from 'react';
import { UserPlus, Search, Edit2, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import UserForm from '@/components/features/users/UserForm';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { useCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/config/collections';
import { addDocument, updateDocument, deleteDocument } from '@/hooks/useFirestore';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { ROLES } from '@/config/roles';
import { getInitials } from '@/utils/formatters';

export default function UsersPage() {
  const { data: staff = [], loading } = useCollection(COLLECTIONS.STAFF);
  const { role: currentUserRole } = useRoleAccess();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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

  const handleFormSubmit = async (formData) => {
    try {
      if (editingUser) {
        await updateDocument(COLLECTIONS.STAFF, editingUser.id, formData);
      } else {
        await addDocument(COLLECTIONS.STAFF, formData);
      }
      setIsFormOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving staff member:', error);
      alert('Failed to save staff member. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDocument(COLLECTIONS.STAFF, userId);
    } catch (error) {
      console.error('Error deleting staff member:', error);
      alert('Failed to delete staff member. Please try again.');
    }
  };

  const canManageStaff = currentUserRole === ROLES.ADMIN || currentUserRole === ROLES.PASTOR;

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
        canManageStaff && (
          <div className="flex items-center justify-end gap-2">
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
          </div>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Staff Access Control Directory"
        badge="Administrative Node"
      />

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

            {canManageStaff && (
              <Button icon={UserPlus} onClick={handleAddUser}>
                Add User
              </Button>
            )}
          </div>
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
    </div>
  );
}

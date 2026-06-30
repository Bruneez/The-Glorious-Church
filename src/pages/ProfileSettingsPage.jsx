import { useState } from 'react';
import { UserCog, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AccountSettingsModal from '@/pages/profile/AccountSettingsModal';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/formatters';

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { firebaseUser, staffProfile } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <PageHeader 
          title="Profile Settings"
          subtitle="Manage your account information and preferences"
        />
      </div>

      <div className="max-w-2xl">
        <Card>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-indigo-600 border-2 border-indigo-400/30 flex items-center justify-center text-2xl font-bold uppercase text-white">
                {staffProfile?.photo ? (
                  <img src={staffProfile.photo} alt={staffProfile.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  getInitials(staffProfile?.name || firebaseUser?.email || 'User')
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{staffProfile?.name || 'User'}</h2>
                <p className="text-slate-400 text-sm">{firebaseUser?.email}</p>
                {staffProfile?.role && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {staffProfile.role}
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email</span>
                    <span className="text-slate-200">{firebaseUser?.email}</span>
                  </div>
                  {staffProfile?.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone</span>
                      <span className="text-slate-200">{staffProfile.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  icon={UserCog}
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full"
                >
                  Edit Account Settings
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

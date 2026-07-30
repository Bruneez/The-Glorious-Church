import { useState } from 'react';

import { useRoleAccess } from '@/hooks/useRoleAccess';

import MyAppFixRequestsPanel from '@/components/features/app-fixes/MyAppFixRequestsPanel';
import AppFixManagementDashboard from '@/components/features/app-fixes/AppFixManagementDashboard';

function FeedbackBanner({ feedback, onDismiss }) {
  if (!feedback?.message) return null;



  const toneClass =

    feedback.type === 'success'

      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'

      : feedback.type === 'warning'

        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'

        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400';



  return (

    <div
      className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between gap-3 ${toneClass}`}
      role="alert"
      aria-live="polite"
    >

      <span>{feedback.message}</span>

      <button type="button" onClick={onDismiss} className="text-current hover:opacity-80 shrink-0">

        Dismiss

      </button>

    </div>

  );

}



export default function AppFixesPage() {

  const { canPerformAction } = useRoleAccess();

  const canManage = canPerformAction('MANAGE_APP_FIXES');

  const [feedback, setFeedback] = useState({ type: '', message: '' });



  return (

    <div className="page-root">

      <div className="min-w-0">

        <h1 className="text-xl font-bold text-white tracking-wide">App Fixes</h1>

        <p className="text-sm text-slate-400 mt-1 max-w-2xl">

          Report app problems and track software fixes.

        </p>

      </div>



      <FeedbackBanner

        feedback={feedback}

        onDismiss={() => setFeedback({ type: '', message: '' })}

      />



      <div className="mt-4 bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm min-w-0">

        <div className="p-4 min-w-0">

          <h2 className="text-sm font-semibold text-white">

            {canManage ? 'Management Dashboard' : 'My Requests'}

          </h2>



          <div className="mt-4 min-w-0">

            {canManage ? (
              <AppFixManagementDashboard
                onFeedback={(type, message) => setFeedback({ type, message })}
              />
            ) : (

              <MyAppFixRequestsPanel

                onFeedback={(type, message) => setFeedback({ type, message })}

              />

            )}

          </div>

        </div>

      </div>

    </div>

  );

}



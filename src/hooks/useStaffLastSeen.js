import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { recordStaffLastSeen } from '@/services/lastSeenService';

const HEARTBEAT_MS = 5 * 60 * 1000;

export function useStaffLastSeen() {
  const { staffDocId, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !staffDocId) return undefined;

    recordStaffLastSeen(staffDocId, { force: true }).catch((error) => {
      console.error('Failed to record last seen:', error);
    });

    const interval = setInterval(() => {
      recordStaffLastSeen(staffDocId).catch((error) => {
        console.error('Failed to record last seen heartbeat:', error);
      });
    }, HEARTBEAT_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated, staffDocId, location.pathname]);
}

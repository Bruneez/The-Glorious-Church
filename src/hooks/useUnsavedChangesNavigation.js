import { useNavigate } from 'react-router-dom';
import { requestGuardedNavigation } from '@/utils/unsavedChangesRegistry';

export function useUnsavedChangesNavigation() {
  const navigate = useNavigate();

  return (to, event) => {
    const proceed = () => navigate(to);
    const allowed = requestGuardedNavigation(proceed);
    if (!allowed) {
      event?.preventDefault();
    }
    return allowed;
  };
}

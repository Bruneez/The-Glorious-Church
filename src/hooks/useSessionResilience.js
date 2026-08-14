import { useEffect, useRef } from 'react';
const RECONNECT_DEBOUNCE_MS = 400;

export function useSessionResilience({ enabled = true, onReconnect } = {}) {
  const onReconnectRef = useRef(onReconnect);

  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    if (!enabled) return undefined;

    let debounceTimer = null;

    const scheduleReconnect = (source) => {
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }

      debounceTimer = window.setTimeout(() => {
        onReconnectRef.current?.(source);
      }, RECONNECT_DEBOUNCE_MS);
    };

    const handleOnline = () => scheduleReconnect('online');
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleReconnect('visibility');
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);
}

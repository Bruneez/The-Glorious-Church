import { useEffect, useRef } from 'react';

export function useFormSessionInit({ isOpen, recordKey, initialize }) {
  const previousIsOpenRef = useRef(false);
  const previousRecordKeyRef = useRef('');
  const initializeRef = useRef(initialize);

  useEffect(() => {
    initializeRef.current = initialize;
  }, [initialize]);

  useEffect(() => {
    const shouldInit =
      isOpen
      && (
        !previousIsOpenRef.current
        || recordKey !== previousRecordKeyRef.current
      );

    if (shouldInit) {
      initializeRef.current();
    }

    if (!isOpen) {
      previousIsOpenRef.current = false;
      previousRecordKeyRef.current = '';
      return;
    }

    previousIsOpenRef.current = true;
    previousRecordKeyRef.current = recordKey;
  }, [isOpen, recordKey]);
}

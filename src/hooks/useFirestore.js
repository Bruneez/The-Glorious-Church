import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { subscribeFirestoreReconnect } from '@/utils/firestoreReconnect';
import { logStability } from '@/utils/stabilityDebug';

function useFirestoreSubscription({
  enabled = true,
  queryKey = '',
  subscribe,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasLoadedOnceRef = useRef(false);
  const queryKeyRef = useRef(queryKey);

  const retry = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setIsSyncing(false);
      return undefined;
    }

    if (queryKeyRef.current !== queryKey) {
      queryKeyRef.current = queryKey;
      hasLoadedOnceRef.current = false;
    }

    let active = true;
    setError(null);

    if (hasLoadedOnceRef.current) {
      setIsSyncing(true);
    } else {
      setLoading(true);
    }

    const unsubscribe = subscribe({
      active: () => active,
      onData: (nextData) => {
        if (!active) return;
        setData(nextData);
        hasLoadedOnceRef.current = true;
        setLoading(false);
        setIsSyncing(false);
        setError(null);
      },
      onError: (err) => {
        if (!active) return;
        logStability('query.subscription.error', {
          code: err?.code || 'unknown',
          message: err?.message || 'Unknown error',
        });
        setError(err);
        setLoading(false);
        setIsSyncing(false);
      },
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [enabled, queryKey, refreshKey, subscribe]);

  useEffect(() => {
    if (!enabled || !error) return undefined;

    return subscribeFirestoreReconnect(() => {
      retry();
    });
  }, [enabled, error, retry]);

  return {
    data,
    loading,
    isSyncing,
    error,
    retry,
    isInitialLoading: loading,
  };
}

export function useCollection(collectionName, options = {}) {
  const constraintsKey = JSON.stringify(options.constraints || []);
  const queryKey = `${collectionName}:${constraintsKey}`;

  const result = useFirestoreSubscription({
    enabled: Boolean(collectionName),
    queryKey,
    subscribe: useCallback(({ active, onData, onError }) => {
      let q = collection(db, collectionName);
      if (options.constraints?.length) {
        q = query(collection(db, collectionName), ...options.constraints);
      }

      return onSnapshot(
        q,
        (snapshot) => {
          if (!active()) return;
          const documents = snapshot.docs.map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }));
          onData(documents);
        },
        onError,
      );
    }, [collectionName, constraintsKey]),
  });

  return {
    data: result.data ?? [],
    loading: result.loading,
    isSyncing: result.isSyncing,
    error: result.error,
    retry: result.retry,
    isInitialLoading: result.isInitialLoading,
  };
}

export function useDocument(collectionName, docId, externalRefreshKey = 0) {
  const queryKey = `${collectionName}:${docId}:${externalRefreshKey}`;

  const result = useFirestoreSubscription({
    enabled: Boolean(collectionName && docId),
    queryKey,
    subscribe: useCallback(({ active, onData, onError }) => {
      if (!docId) {
        onData(null);
        return undefined;
      }

      return onSnapshot(
        doc(db, collectionName, docId),
        (docSnapshot) => {
          if (!active()) return;
          if (docSnapshot.exists()) {
            onData({ id: docSnapshot.id, ...docSnapshot.data() });
          } else {
            onData(null);
          }
        },
        onError,
      );
    }, [collectionName, docId]),
  });

  return {
    data: result.data ?? null,
    loading: result.loading,
    isSyncing: result.isSyncing,
    error: result.error,
    retry: result.retry,
    isInitialLoading: result.isInitialLoading,
  };
}

export async function getDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

export async function getDocuments(collectionName, constraints = []) {
  try {
    let q = collection(db, collectionName);
    if (constraints.length > 0) {
      q = query(collection(db, collectionName), ...constraints);
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
}

export async function addDocument(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

export async function updateDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    return { id: docId, ...data };
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

export async function deleteDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return docId;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

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

export function useCollection(collectionName, options = {}) {
  const constraints = options.constraints || [];
  const constraintsSignature = JSON.stringify(constraints);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(collectionName));
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasLoadedOnceRef = useRef(false);
  const queryKeyRef = useRef('');

  const retry = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      setIsSyncing(false);
      return undefined;
    }

    const nextQueryKey = `${collectionName}:${constraintsSignature}:${refreshKey}`;
    if (queryKeyRef.current !== nextQueryKey) {
      queryKeyRef.current = nextQueryKey;
      if (refreshKey === 0) {
        hasLoadedOnceRef.current = false;
      }
    }

    let active = true;
    setError(null);

    if (hasLoadedOnceRef.current) {
      setIsSyncing(true);
    } else {
      setLoading(true);
    }

    let q = collection(db, collectionName);
    if (constraints.length > 0) {
      q = query(collection(db, collectionName), ...constraints);
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!active) return;

        const documents = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));

        setData(documents);
        hasLoadedOnceRef.current = true;
        setLoading(false);
        setIsSyncing(false);
        setError(null);
      },
      (err) => {
        if (!active) return;

        logStability('query.subscription.error', {
          code: err?.code || 'unknown',
        });
        setError(err);
        setLoading(false);
        setIsSyncing(false);
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [collectionName, constraintsSignature, refreshKey]);

  useEffect(() => {
    if (!collectionName || !error) return undefined;

    return subscribeFirestoreReconnect(() => {
      retry();
    });
  }, [collectionName, error, retry]);

  return {
    data: data ?? [],
    loading,
    isSyncing,
    error,
    retry,
    isInitialLoading: loading,
  };
}

export function useDocument(collectionName, docId, externalRefreshKey = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(collectionName && docId));
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasLoadedOnceRef = useRef(false);

  const retry = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  const enabled = Boolean(collectionName && docId);
  const subscriptionKey = `${collectionName}:${docId}:${externalRefreshKey}:${refreshKey}`;

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      setIsSyncing(false);
      return undefined;
    }

    let active = true;
    setError(null);

    if (hasLoadedOnceRef.current) {
      setIsSyncing(true);
    } else {
      setLoading(true);
    }

    const unsubscribe = onSnapshot(
      doc(db, collectionName, docId),
      (docSnapshot) => {
        if (!active) return;

        if (docSnapshot.exists()) {
          setData({ id: docSnapshot.id, ...docSnapshot.data() });
        } else {
          setData(null);
        }

        hasLoadedOnceRef.current = true;
        setLoading(false);
        setIsSyncing(false);
        setError(null);
      },
      (err) => {
        if (!active) return;

        logStability('query.subscription.error', {
          code: err?.code || 'unknown',
        });
        setError(err);
        setLoading(false);
        setIsSyncing(false);
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [collectionName, docId, enabled, subscriptionKey]);

  useEffect(() => {
    if (!enabled || !error) return undefined;

    return subscribeFirestoreReconnect(() => {
      retry();
    });
  }, [enabled, error, retry]);

  return {
    data: data ?? null,
    loading,
    isSyncing,
    error,
    retry,
    isInitialLoading: loading,
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

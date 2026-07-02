import { useEffect, useState } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export function useCollection(collectionName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.info(`useCollection: subscribing to '${collectionName}'`, { constraints: options.constraints });
    setLoading(true);
    let q = collection(db, collectionName);

    if (options.constraints) {
      q = query(collection(db, collectionName), ...options.constraints);
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.info(`useCollection: received snapshot for '${collectionName}' (docs=${snapshot.size})`);
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(documents);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`useCollection: error fetching collection ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(options.constraints)]);

  return { data, loading, error };
}

export function useDocument(collectionName, docId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, collectionName, docId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setData({ id: docSnapshot.id, ...docSnapshot.data() });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching document ${docId}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading, error };
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
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

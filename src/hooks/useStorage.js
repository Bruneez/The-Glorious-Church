import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/config/firebase';

const MEMBER_STORAGE_CLEANUP_LOG = '[Member Storage Cleanup]';

export async function uploadFile(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadImage(file, folder = 'images') {
  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  const path = `${folder}/${filename}`;
  return uploadFile(file, path);
}

export async function deleteFile(path) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
  return true;
}

export async function deleteFileSafe(path) {
  const normalizedPath = String(path || '').trim();
  if (!normalizedPath) return false;

  console.info(`${MEMBER_STORAGE_CLEANUP_LOG} deleting:`, {
    path: normalizedPath,
    bucket: storage?.app?.options?.storageBucket || '',
  });

  try {
    const fileRef = ref(storage, normalizedPath);
    await deleteObject(fileRef);
    console.info(`${MEMBER_STORAGE_CLEANUP_LOG} deleted:`, normalizedPath);
    return true;
  } catch (error) {
    if (error?.code === 'storage/object-not-found') {
      console.info(`${MEMBER_STORAGE_CLEANUP_LOG} failed:`, {
        path: normalizedPath,
        code: error.code,
        message: error.message,
      });
      return false;
    }

    console.warn(`${MEMBER_STORAGE_CLEANUP_LOG} failed:`, {
      path: normalizedPath,
      code: error?.code || 'unknown',
      message: error?.message || 'Unknown storage delete error',
    });
    throw error;
  }
}

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFileWithState = async (file, path) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const downloadURL = await uploadFile(file, path);
      setProgress(100);
      setUploading(false);
      return downloadURL;
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err);
      setUploading(false);
      throw err;
    }
  };

  const uploadImageWithState = async (file, folder = 'images') => {
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const path = `${folder}/${filename}`;
    return uploadFileWithState(file, path);
  };

  const deleteFileWithState = async (path) => {
    try {
      return await deleteFile(path);
    } catch (err) {
      console.error('Error deleting file:', err);
      throw err;
    }
  };

  return {
    uploadFile: uploadFileWithState,
    uploadImage: uploadImageWithState,
    deleteFile: deleteFileWithState,
    uploading,
    progress,
    error,
  };
}

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/config/firebase';

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

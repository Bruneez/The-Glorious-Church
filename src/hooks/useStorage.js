import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/config/firebase';

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file, path) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
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

  const uploadImage = async (file, folder = 'images') => {
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const path = `${folder}/${filename}`;
    return uploadFile(file, path);
  };

  const deleteFile = async (path) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      throw err;
    }
  };

  return {
    uploadFile,
    uploadImage,
    deleteFile,
    uploading,
    progress,
    error
  };
}

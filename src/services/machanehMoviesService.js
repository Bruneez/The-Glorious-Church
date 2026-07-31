import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { canPerformAction } from '@/config/permissions';
import {
  buildMachanehMovieFirestoreDocument,
  buildMachanehMoviePayload,
  isPermanentPosterUrl,
  mergeMachanehMovies,
  validateMachanehMovieForm,
  validateMoviePosterFile,
} from '@/config/machanehMoviesOptions';
import { toMachanehMovieFirestoreError } from '@/config/machanehMoviesFirestoreValidation';
import { resolveMachanehMoviePosterStoragePath } from '@/utils/storagePathUtils';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { deleteDocument, getDocument } from '@/hooks/useFirestore';
import {
  assertCanManageMachanehMovies,
  assertCanViewMachanehMovies,
  VIEW_DENIED_MESSAGE,
} from '@/services/machanehMoviesGuards';
import {
  cleanupMachanehMoviePosterStoragePath,
  resolvePreviousMachanehMoviePosterPath,
  shouldCleanupPreviousMachanehMoviePoster,
} from '@/services/machanehMoviesStorageLifecycle';
import {
  deleteMachanehMoviePoster,
  uploadMachanehMoviePoster,
} from '@/services/storageService';

async function rollbackNewUpload(posterStoragePath) {
  if (!posterStoragePath) return;

  try {
    await deleteMachanehMoviePoster(posterStoragePath);
  } catch {
    // Non-blocking rollback failure.
  }
}

export function useMachanehMovies() {
  const { role } = useAuth();
  const canView = canPerformAction(role, 'VIEW_MACHANEH_MOVIES');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const optimisticMovieIdsRef = useRef(new Set());

  const upsertMovie = useCallback((movie) => {
    if (!movie?.id) return;

    optimisticMovieIdsRef.current.add(movie.id);
    setData((previousMovies) => mergeMachanehMovies(previousMovies, [movie]));
  }, []);

  const removeMovie = useCallback((movieId) => {
    const normalizedId = String(movieId || '').trim();
    if (!normalizedId) return;

    optimisticMovieIdsRef.current.delete(normalizedId);
    setData((previousMovies) => previousMovies.filter((movie) => movie.id !== normalizedId));
  }, []);

  useEffect(() => {
    if (!canView) {
      optimisticMovieIdsRef.current.clear();
      setData([]);
      setLoading(false);
      setError(new Error(VIEW_DENIED_MESSAGE));
      return undefined;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, COLLECTIONS.MACHANEH_MOVIES),
      orderBy('updatedAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const snapshotMovies = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));
        const snapshotIds = new Set(snapshotMovies.map((movie) => movie.id));

        for (const movieId of optimisticMovieIdsRef.current) {
          if (snapshotIds.has(movieId)) {
            optimisticMovieIdsRef.current.delete(movieId);
          }
        }

        setData((previousMovies) => {
          const pendingOptimistic = previousMovies.filter(
            (movie) =>
              movie.id
              && optimisticMovieIdsRef.current.has(movie.id)
              && !snapshotIds.has(movie.id),
          );

          return mergeMachanehMovies(snapshotMovies, pendingOptimistic);
        });
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        console.error('useMachanehMovies subscription error:', snapshotError);
        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [canView]);

  return { data, loading, error, canView, upsertMovie, removeMovie };
}

export async function createMachanehMovie(formData, { role, createdBy = '', posterFile = null } = {}) {
  assertCanManageMachanehMovies(role);

  if (posterFile) {
    const posterValidationMessage = validateMoviePosterFile(posterFile);
    if (posterValidationMessage) {
      throw new Error(posterValidationMessage);
    }
  } else {
    throw new Error('Poster image is required.');
  }

  const docRef = doc(collection(db, COLLECTIONS.MACHANEH_MOVIES));
  const movieId = docRef.id;

  const uploadedPoster = await uploadMachanehMoviePoster(posterFile, movieId);

  const payload = buildMachanehMoviePayload(
    {
      ...formData,
      posterUrl: uploadedPoster.posterUrl,
      posterStoragePath: uploadedPoster.posterStoragePath,
    },
    { createdBy },
  );

  const validationMessage = validateMachanehMovieForm(payload, { requirePoster: true });
  if (validationMessage) {
    await rollbackNewUpload(uploadedPoster.posterStoragePath);
    throw new Error(validationMessage);
  }

  try {
    const documentData = buildMachanehMovieFirestoreDocument(payload, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(docRef, documentData);

    const savedMovie = await getDocument(COLLECTIONS.MACHANEH_MOVIES, movieId);
    if (!savedMovie?.id) {
      return {
        movie: { id: movieId, ...payload },
        storageWarnings: [],
      };
    }

    return {
      movie: savedMovie,
      storageWarnings: [],
    };
  } catch (error) {
    await rollbackNewUpload(uploadedPoster.posterStoragePath);
    throw toMachanehMovieFirestoreError(error);
  }
}

export async function updateMachanehMovie(
  movieId,
  formData,
  { role, createdBy = '', initialData = null, posterFile = null, removePoster = false } = {},
) {
  assertCanManageMachanehMovies(role);

  if (!movieId) {
    throw new Error('Movie ID is required.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.MACHANEH_MOVIES, movieId));
  if (!existing) {
    throw new Error('Movie not found.');
  }

  if (posterFile) {
    const posterValidationMessage = validateMoviePosterFile(posterFile);
    if (posterValidationMessage) {
      throw new Error(posterValidationMessage);
    }
  }

  const previousPosterPath = resolvePreviousMachanehMoviePosterPath(formData, existing);
  let replacementPoster = null;

  let nextPosterUrl = isPermanentPosterUrl(formData.posterUrl)
    ? String(formData.posterUrl).trim()
    : existing.posterUrl || '';
  let nextPosterPath = String(formData.posterStoragePath || existing.posterStoragePath || '').trim();

  if (removePoster) {
    nextPosterUrl = '';
    nextPosterPath = '';
  } else if (posterFile) {
    replacementPoster = await uploadMachanehMoviePoster(posterFile, movieId);
    nextPosterUrl = replacementPoster.posterUrl;
    nextPosterPath = replacementPoster.posterStoragePath;
  }

  const payload = buildMachanehMoviePayload(
    {
      ...formData,
      posterUrl: nextPosterUrl,
      posterStoragePath: nextPosterPath,
      createdBy: existing.createdBy || createdBy,
    },
    { createdBy: existing.createdBy || createdBy },
  );

  const validationMessage = validateMachanehMovieForm(payload, { requirePoster: true });
  if (validationMessage) {
    await rollbackNewUpload(replacementPoster?.posterStoragePath);
    throw new Error(validationMessage);
  }

  try {
    await updateDoc(doc(db, COLLECTIONS.MACHANEH_MOVIES, movieId), {
      ...payload,
      updatedAt: serverTimestamp(),
    });

    const storageWarnings = [];

    if (shouldCleanupPreviousMachanehMoviePoster(previousPosterPath, nextPosterPath)) {
      const warning = await cleanupMachanehMoviePosterStoragePath(
        previousPosterPath,
        deleteMachanehMoviePoster,
      );
      if (warning) storageWarnings.push(warning);
    }

    return {
      movie: { id: movieId, ...payload },
      storageWarnings,
    };
  } catch (error) {
    await rollbackNewUpload(replacementPoster?.posterStoragePath);
    throw error;
  }
}

export async function deleteMachanehMovie(movieId, { role, initialData = null } = {}) {
  assertCanManageMachanehMovies(role);

  if (!movieId) {
    throw new Error('Movie ID is required.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.MACHANEH_MOVIES, movieId));
  if (!existing) {
    throw new Error('Movie not found.');
  }

  const posterStoragePath = resolveMachanehMoviePosterStoragePath(existing);

  await deleteDocument(COLLECTIONS.MACHANEH_MOVIES, movieId);

  const storageWarnings = [];
  const warning = await cleanupMachanehMoviePosterStoragePath(
    posterStoragePath,
    deleteMachanehMoviePoster,
  );
  if (warning) storageWarnings.push(warning);

  return { movieId, storageWarnings };
}

export async function replaceMachanehMoviePoster(
  movieId,
  posterFile,
  { role, initialData = null } = {},
) {
  assertCanManageMachanehMovies(role);

  if (!movieId) {
    throw new Error('Movie ID is required.');
  }

  const posterValidationMessage = validateMoviePosterFile(posterFile);
  if (posterValidationMessage) {
    throw new Error(posterValidationMessage);
  }

  const existing = initialData || (await getDocument(COLLECTIONS.MACHANEH_MOVIES, movieId));
  if (!existing) {
    throw new Error('Movie not found.');
  }

  const previousPosterPath = resolveMachanehMoviePosterStoragePath(existing);
  const replacementPoster = await uploadMachanehMoviePoster(posterFile, movieId);

  try {
    await updateDoc(doc(db, COLLECTIONS.MACHANEH_MOVIES, movieId), {
      posterUrl: replacementPoster.posterUrl,
      posterStoragePath: replacementPoster.posterStoragePath,
      updatedAt: serverTimestamp(),
    });

    const storageWarnings = [];

    if (shouldCleanupPreviousMachanehMoviePoster(previousPosterPath, replacementPoster.posterStoragePath)) {
      const warning = await cleanupMachanehMoviePosterStoragePath(
        previousPosterPath,
        deleteMachanehMoviePoster,
      );
      if (warning) storageWarnings.push(warning);
    }

    return {
      ...replacementPoster,
      storageWarnings,
    };
  } catch (error) {
    await rollbackNewUpload(replacementPoster.posterStoragePath);
    throw error;
  }
}

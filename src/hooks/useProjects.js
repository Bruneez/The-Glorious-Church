import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { canPerformAction } from '@/config/permissions';
import { enrichProjectForDisplay } from '@/config/projectsDisplay';
import {
  isProjectMembershipDeleted,
} from '@/config/projectsOptions';
import { useAuth } from '@/hooks/useAuth';
import { auth, db } from '@/config/firebase';
import {
  getProjectMembershipsByUserQueryConstraints,
  getProjectsQueryConstraints,
  normalizeProjects,
  sortProjectMemberships,
} from '@/services/projectsQueryUtils';
import { subscribeFirestoreReconnect } from '@/utils/firestoreReconnect';

export function useProjects({ reloadNonce = 0 } = {}) {
  const {
    role,
    firebaseUser,
    isLoading: authLoading,
    isStaffSessionLoading,
  } = useAuth();
  const userId = firebaseUser?.uid || '';
  const sessionReady = !authLoading && Boolean(firebaseUser) && !isStaffSessionLoading;
  const canView = canPerformAction(role, 'VIEW_PROJECTS');

  const [rawProjects, setRawProjects] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membershipsLoading, setMembershipsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [membershipError, setMembershipError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const retry = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  const projects = useMemo(
    () => normalizeProjects(rawProjects, role, userId),
    [rawProjects, role, userId],
  );

  useEffect(() => {
    if (!sessionReady) {
      setLoading(true);
      setMembershipsLoading(true);
      setError(null);
      setMembershipError(null);
      return undefined;
    }

    if (!userId || !canView) {
      setRawProjects([]);
      setMemberships([]);
      setLoading(false);
      setMembershipsLoading(false);
      setError(null);
      setMembershipError(null);
      return undefined;
    }

    let active = true;
    let unsubscribeProjects = () => {};
    let unsubscribeMemberships = () => {};

    const startSubscriptions = async () => {
      setLoading(true);
      setMembershipsLoading(true);
      setError(null);
      setMembershipError(null);

      try {
        await auth.authStateReady();
      } catch (readyError) {
        if (!active) return;
        console.error('useProjects auth readiness error:', readyError);
      }

      if (!active || !auth.currentUser) {
        return;
      }

      const projectQuery = query(
        collection(db, COLLECTIONS.PROJECTS),
        ...getProjectsQueryConstraints(),
      );
      const membershipQuery = query(
        collection(db, COLLECTIONS.PROJECT_MEMBERSHIPS),
        ...getProjectMembershipsByUserQueryConstraints(userId),
      );

      unsubscribeProjects = onSnapshot(
        projectQuery,
        (snapshot) => {
          if (!active) return;

          const nextProjects = snapshot.docs.map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }));

          setRawProjects(nextProjects);
          setLoading(false);
          setError(null);
        },
        (snapshotError) => {
          if (!active) return;

          console.error('useProjects projects subscription error:', snapshotError);
          setError(snapshotError);
          setLoading(false);
        },
      );

      unsubscribeMemberships = onSnapshot(
        membershipQuery,
        (snapshot) => {
          if (!active) return;

          const nextMemberships = snapshot.docs.map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }));

          setMemberships(
            sortProjectMemberships(
              nextMemberships.filter((membership) => !isProjectMembershipDeleted(membership)),
            ),
          );
          setMembershipsLoading(false);
          setMembershipError(null);
        },
        (snapshotError) => {
          if (!active) return;

          console.error('useProjects memberships subscription error:', snapshotError);
          setMemberships([]);
          setMembershipsLoading(false);
          setMembershipError(snapshotError);
        },
      );
    };

    startSubscriptions();

    return () => {
      active = false;
      unsubscribeProjects();
      unsubscribeMemberships();
    };
  }, [sessionReady, canView, userId, reloadNonce, refreshKey]);

  useEffect(() => {
    if (!error) return undefined;

    return subscribeFirestoreReconnect(() => {
      retry();
    });
  }, [error, retry]);

  const membershipByProjectId = useMemo(() => {
    const map = new Map();
    memberships.forEach((membership) => {
      const existing = map.get(membership.projectId);
      if (!existing || Number(membership.updatedAt?.toDate?.()?.getTime?.() || Date.parse(membership.updatedAt || 0))
        >= Number(existing.updatedAt?.toDate?.()?.getTime?.() || Date.parse(existing.updatedAt || 0))) {
        map.set(membership.projectId, membership);
      }
    });
    return map;
  }, [memberships]);

  const data = useMemo(
    () => projects.map((project) => enrichProjectForDisplay(project, {
      membership: membershipByProjectId.get(project.id) || null,
      userId,
      role,
    })),
    [projects, membershipByProjectId, userId, role],
  );

  return {
    data,
    projects,
    memberships,
    loading,
    membershipsLoading,
    error,
    membershipError,
    canView,
    userId,
    role,
    isInitialLoading: loading && rawProjects.length === 0,
    retry,
  };
}

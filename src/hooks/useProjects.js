import { useEffect, useMemo, useState } from 'react';
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
import { db } from '@/config/firebase';
import { VIEW_DENIED_MESSAGE } from '@/services/projectGuards';
import {
  getProjectMembershipsByUserQueryConstraints,
  getProjectsQueryConstraints,
  normalizeProjects,
} from '@/services/projectsQueryUtils';

export function useProjects({ reloadNonce = 0 } = {}) {
  const { role, firebaseUser } = useAuth();
  const userId = firebaseUser?.uid || '';
  const canView = canPerformAction(role, 'VIEW_PROJECTS');

  const [projects, setProjects] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canView || !userId) {
      setProjects([]);
      setMemberships([]);
      setLoading(false);
      setError(canView ? null : new Error(VIEW_DENIED_MESSAGE));
      return undefined;
    }

    setLoading(true);
    setError(null);

    const projectQuery = query(
      collection(db, COLLECTIONS.PROJECTS),
      ...getProjectsQueryConstraints(),
    );
    const membershipQuery = query(
      collection(db, COLLECTIONS.PROJECT_MEMBERSHIPS),
      ...getProjectMembershipsByUserQueryConstraints(userId),
    );

    let projectsReady = false;
    let membershipsReady = false;

    const maybeFinishLoading = () => {
      if (projectsReady && membershipsReady) {
        setLoading(false);
      }
    };

    const unsubscribeProjects = onSnapshot(
      projectQuery,
      (snapshot) => {
        const nextProjects = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));

        setProjects(normalizeProjects(nextProjects, role, userId));
        projectsReady = true;
        maybeFinishLoading();
        setError(null);
      },
      (snapshotError) => {
        console.error('useProjects projects subscription error:', snapshotError);
        setError(snapshotError);
        projectsReady = true;
        setLoading(false);
      },
    );

    const unsubscribeMemberships = onSnapshot(
      membershipQuery,
      (snapshot) => {
        const nextMemberships = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));

        setMemberships(
          nextMemberships.filter((membership) => !isProjectMembershipDeleted(membership)),
        );
        membershipsReady = true;
        maybeFinishLoading();
      },
      (snapshotError) => {
        console.error('useProjects memberships subscription error:', snapshotError);
        setError((current) => current || snapshotError);
        membershipsReady = true;
        setLoading(false);
      },
    );

    return () => {
      unsubscribeProjects();
      unsubscribeMemberships();
    };
  }, [canView, role, userId, reloadNonce]);

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
    error,
    canView,
    userId,
    role,
  };
}

import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { canPerformAction } from '@/config/permissions';
import { enrichProjectForDisplay } from '@/config/projectsDisplay';
import {
  isProjectDeleted,
  isProjectMembershipDeleted,
  isProjectUpdateDeleted,
  isProjectAttachmentDeleted,
} from '@/config/projectsOptions';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import {
  canViewProject,
  VIEW_DENIED_MESSAGE,
} from '@/services/projectGuards';
import {
  getProjectAttachmentsQueryConstraints,
  getProjectMembershipsQueryConstraints,
  getProjectUpdatesQueryConstraints,
} from '@/services/projectsQueryUtils';

export function useProject(projectId = '') {
  const { role, firebaseUser } = useAuth();
  const userId = firebaseUser?.uid || '';
  const canView = canPerformAction(role, 'VIEW_PROJECTS');

  const [project, setProject] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const normalizedProjectId = String(projectId || '').trim();

    if (!canView || !userId || !normalizedProjectId) {
      setProject(null);
      setMemberships([]);
      setUpdates([]);
      setAttachments([]);
      setLoading(false);
      setError(canView ? null : new Error(VIEW_DENIED_MESSAGE));
      return undefined;
    }

    setLoading(true);
    setError(null);

    let projectReady = false;
    let membershipsReady = false;
    let updatesReady = false;
    let attachmentsReady = false;

    const maybeFinishLoading = () => {
      if (projectReady && membershipsReady && updatesReady && attachmentsReady) {
        setLoading(false);
      }
    };

    const projectRef = doc(db, COLLECTIONS.PROJECTS, normalizedProjectId);
    const membershipQuery = query(
      collection(db, COLLECTIONS.PROJECT_MEMBERSHIPS),
      ...getProjectMembershipsQueryConstraints(normalizedProjectId),
    );
    const updatesQuery = query(
      collection(db, COLLECTIONS.PROJECT_UPDATES),
      ...getProjectUpdatesQueryConstraints(normalizedProjectId),
    );
    const attachmentsQuery = query(
      collection(db, COLLECTIONS.PROJECT_ATTACHMENTS),
      ...getProjectAttachmentsQueryConstraints(normalizedProjectId),
    );

    const unsubscribeProject = onSnapshot(
      projectRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setProject(null);
          setError(new Error('Project not found.'));
          projectReady = true;
          setLoading(false);
          return;
        }

        const nextProject = {
          id: snapshot.id,
          ...snapshot.data(),
        };

        if (isProjectDeleted(nextProject)) {
          setProject(null);
          setError(new Error('Project not found.'));
          projectReady = true;
          setLoading(false);
          return;
        }

        setProject(nextProject);
        projectReady = true;
        maybeFinishLoading();
      },
      (snapshotError) => {
        console.error('useProject project subscription error:', snapshotError);
        setError(snapshotError);
        projectReady = true;
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
        console.error('useProject memberships subscription error:', snapshotError);
        setError((current) => current || snapshotError);
        membershipsReady = true;
        setLoading(false);
      },
    );

    const unsubscribeUpdates = onSnapshot(
      updatesQuery,
      (snapshot) => {
        const nextUpdates = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));

        setUpdates(nextUpdates.filter((update) => !isProjectUpdateDeleted(update)));
        updatesReady = true;
        maybeFinishLoading();
      },
      (snapshotError) => {
        console.error('useProject updates subscription error:', snapshotError);
        setError((current) => current || snapshotError);
        updatesReady = true;
        setLoading(false);
      },
    );

    const unsubscribeAttachments = onSnapshot(
      attachmentsQuery,
      (snapshot) => {
        const nextAttachments = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));

        setAttachments(
          nextAttachments.filter((attachment) => !isProjectAttachmentDeleted(attachment)),
        );
        attachmentsReady = true;
        maybeFinishLoading();
      },
      (snapshotError) => {
        console.error('useProject attachments subscription error:', snapshotError);
        setError((current) => current || snapshotError);
        attachmentsReady = true;
        setLoading(false);
      },
    );

    return () => {
      unsubscribeProject();
      unsubscribeMemberships();
      unsubscribeUpdates();
      unsubscribeAttachments();
    };
  }, [canView, projectId, userId]);

  const userMembership = useMemo(() => {
    const matches = memberships.filter((membership) => membership.userId === userId);
    if (!matches.length) return null;

    return matches.reduce((latest, membership) => {
      const latestTime = Number(latest?.updatedAt?.toDate?.()?.getTime?.()
        || Date.parse(latest?.updatedAt || 0));
      const membershipTime = Number(membership.updatedAt?.toDate?.()?.getTime?.()
        || Date.parse(membership.updatedAt || 0));
      return membershipTime >= latestTime ? membership : latest;
    }, matches[0]);
  }, [memberships, userId]);

  const canAccessProject = useMemo(() => {
    if (!project || loading) return false;
    return canViewProject(role, project, userId, userMembership);
  }, [project, loading, role, userId, userMembership]);

  const accessDenied = Boolean(project && !loading && !canAccessProject);

  const data = useMemo(() => {
    if (!project || !canAccessProject) return null;

    return enrichProjectForDisplay(project, {
      membership: userMembership,
      userId,
      role,
    });
  }, [project, userMembership, userId, role, canAccessProject]);

  return {
    project: data,
    rawProject: project,
    memberships,
    updates,
    attachments,
    userMembership,
    loading,
    error,
    accessDenied,
    canView,
    canAccessProject,
    userId,
    role,
  };
}

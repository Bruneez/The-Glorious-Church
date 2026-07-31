import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { PROJECT_MEMBERSHIP_ROLE, PROJECT_MEMBERSHIP_STATUS, PROJECT_UPDATE_TYPE } from '@/config/projectsConstants';
import {
  buildProjectMembershipFirestoreDocument,
  buildProjectMembershipPayload,
  hasBlockingProjectMembership,
  isProjectMembershipActive,
  isProjectMembershipDeleted,
  isProjectMembershipPending,
  isProjectMembershipRejected,
  validateProjectMembershipForm,
} from '@/config/projectsOptions';
import { db } from '@/config/firebase';
import { getDocument, getDocuments } from '@/hooks/useFirestore';
import {
  assertCanApproveMembership,
  assertCanAssignProjectLeader,
  assertCanCancelJoinRequest,
  assertCanInviteMember,
  assertCanJoinProject,
  assertCanLeaveProject,
  assertCanManageProject,
  assertCanManageProjectTeam,
  assertCanRejectMembership,
  assertCanRemoveMember,
  assertCanRequestToJoin,
  assertCanTransferProjectLeadership,
  assertCanViewProject,
} from '@/services/projectGuards';
import { loadProject } from '@/services/projectLoader';
import { createProjectUpdate } from '@/services/projectUpdateService';
import {
  notifyProjectJoinApproved,
  notifyProjectJoinRejected,
  notifyProjectJoinRequest,
  notifyProjectLeaderAssigned,
} from '@/services/projectNotificationService';
import {
  getProjectMembershipsByUserQueryConstraints,
  getProjectMembershipsQueryConstraints,
} from '@/services/projectsQueryUtils';

function assertNoBlockingMembership(membership) {
  if (!membership) return;

  if (isProjectMembershipActive(membership)) {
    throw new Error('You are already a member of this project.');
  }

  if (isProjectMembershipPending(membership)) {
    throw new Error('You already have a pending request for this project.');
  }
}

async function incrementProjectMemberCount(projectId, project, delta) {
  await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
    memberCount: Math.max(0, Number(project.memberCount || 0) + delta),
    updatedAt: serverTimestamp(),
  });
}

async function dispatchProjectJoinRequestNotification(project, { memberName = '', staffId = '' } = {}) {
  const projectMemberships = await getDocuments(
    COLLECTIONS.PROJECT_MEMBERSHIPS,
    getProjectMembershipsQueryConstraints(project.id),
  );

  await notifyProjectJoinRequest({
    project,
    memberships: projectMemberships.filter((membership) => !isProjectMembershipDeleted(membership)),
    requesterName: memberName,
    excludeStaffId: staffId || '',
  }).catch((notificationError) => {
    console.error('Failed to send project join request notification:', notificationError);
  });
}

export async function listMembershipsForProject(projectId, { role, userId = '' } = {}) {
  await loadProject(projectId, { role, userId });

  const memberships = await getDocuments(
    COLLECTIONS.PROJECT_MEMBERSHIPS,
    getProjectMembershipsQueryConstraints(projectId),
  );

  return memberships.filter((membership) => !isProjectMembershipDeleted(membership));
}

export async function listMembershipsForUser(userId, { role, currentUserId = '' } = {}) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  const memberships = await getDocuments(
    COLLECTIONS.PROJECT_MEMBERSHIPS,
    getProjectMembershipsByUserQueryConstraints(userId),
  );

  return memberships.filter((membership) => !isProjectMembershipDeleted(membership));
}

export async function getMembership(membershipId, { role, userId = '' } = {}) {
  if (!membershipId) {
    throw new Error('Membership ID is required.');
  }

  const membership = await getDocument(COLLECTIONS.PROJECT_MEMBERSHIPS, membershipId);
  if (!membership || isProjectMembershipDeleted(membership)) {
    throw new Error('Membership not found.');
  }

  const project = await loadProject(membership.projectId, { role, userId });
  assertCanViewProject(role, project, userId, membership);

  return membership;
}

export async function getMembershipForUser(projectId, userId, { role, currentUserId = '' } = {}) {
  const project = await loadProject(projectId, { role, userId: currentUserId });
  assertCanViewProject(role, project, currentUserId);

  const memberships = await getDocuments(COLLECTIONS.PROJECT_MEMBERSHIPS, [
    where('projectId', '==', projectId),
    where('userId', '==', userId),
  ]);

  return memberships.find((membership) => !isProjectMembershipDeleted(membership)) || null;
}

export async function createOwnerMembership(
  projectId,
  { role, userId = '', staffId = '', memberName = '' } = {},
) {
  const payload = buildProjectMembershipPayload(
    {
      projectId,
      role: PROJECT_MEMBERSHIP_ROLE.OWNER,
    },
    { userId, staffId, memberName },
  );

  const validationMessage = validateProjectMembershipForm(payload);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const docRef = doc(collection(db, COLLECTIONS.PROJECT_MEMBERSHIPS));
  const document = buildProjectMembershipFirestoreDocument(payload, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    joinedAt: serverTimestamp(),
    deletedAt: null,
  });

  await setDoc(docRef, document);

  return {
    membership: { id: docRef.id, ...document },
  };
}

export async function joinProject(
  projectId,
  { role, userId = '', staffId = '', memberName = '', currentUserId = '' } = {},
) {
  const project = await loadProject(projectId, { role, userId: currentUserId });
  const existingMembership = await getMembershipForUser(projectId, userId, {
    role,
    currentUserId,
  });

  assertCanJoinProject(role, project, userId, existingMembership);
  assertNoBlockingMembership(existingMembership);

  const payload = buildProjectMembershipPayload(
    {
      projectId,
      role: PROJECT_MEMBERSHIP_ROLE.MEMBER,
    },
    { userId, staffId, memberName },
  );

  if (existingMembership && isProjectMembershipRejected(existingMembership)) {
    const document = buildProjectMembershipFirestoreDocument(payload, {
      createdAt: existingMembership.createdAt ?? null,
      updatedAt: serverTimestamp(),
      joinedAt: serverTimestamp(),
      deletedAt: null,
      reviewedAt: null,
      reviewedByUserId: null,
      reviewedByName: null,
    });

    await updateDoc(doc(db, COLLECTIONS.PROJECT_MEMBERSHIPS, existingMembership.id), {
      ...document,
      updatedAt: serverTimestamp(),
    });

    await incrementProjectMemberCount(projectId, project, 1);

    await createProjectUpdate(
      projectId,
      {
        updateType: PROJECT_UPDATE_TYPE.MEMBER_JOINED,
        message: `${memberName || 'A member'} joined the project.`,
      },
      { role, createdByUserId: userId, createdByName: memberName },
    );

    return {
      membership: { id: existingMembership.id, ...document },
    };
  }

  const docRef = doc(collection(db, COLLECTIONS.PROJECT_MEMBERSHIPS));
  const document = buildProjectMembershipFirestoreDocument(payload, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    joinedAt: serverTimestamp(),
    deletedAt: null,
  });

  await setDoc(docRef, document);

  await incrementProjectMemberCount(projectId, project, 1);

  await createProjectUpdate(
    projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.MEMBER_JOINED,
      message: `${memberName || 'A member'} joined the project.`,
    },
    { role, createdByUserId: userId, createdByName: memberName },
  );

  return {
    membership: { id: docRef.id, ...document },
  };
}

export async function requestToJoinProject(
  projectId,
  { role, userId = '', staffId = '', memberName = '', currentUserId = '' } = {},
) {
  const project = await loadProject(projectId, { role, userId: currentUserId });
  const existingMembership = await getMembershipForUser(projectId, userId, {
    role,
    currentUserId,
  });

  assertCanRequestToJoin(role, project, userId, existingMembership);

  if (existingMembership && isProjectMembershipRejected(existingMembership)) {
    const document = buildProjectMembershipFirestoreDocument(
      buildProjectMembershipPayload(
        {
          projectId,
          role: PROJECT_MEMBERSHIP_ROLE.MEMBER,
          status: PROJECT_MEMBERSHIP_STATUS.PENDING,
        },
        { userId, staffId, memberName },
      ),
      {
        createdAt: existingMembership.createdAt ?? null,
        updatedAt: serverTimestamp(),
        joinedAt: null,
        deletedAt: null,
        reviewedAt: null,
        reviewedByUserId: null,
        reviewedByName: null,
      },
    );

    await updateDoc(doc(db, COLLECTIONS.PROJECT_MEMBERSHIPS, existingMembership.id), {
      ...document,
      updatedAt: serverTimestamp(),
    });

    await createProjectUpdate(
      projectId,
      {
        updateType: PROJECT_UPDATE_TYPE.MEMBER_REQUESTED,
        message: `${memberName || 'A member'} requested to join the project.`,
      },
      { role, createdByUserId: userId, createdByName: memberName },
    );

    await dispatchProjectJoinRequestNotification(project, { memberName, staffId });

    return {
      membership: { id: existingMembership.id, ...document },
    };
  }

  assertNoBlockingMembership(existingMembership);

  const payload = buildProjectMembershipPayload(
    {
      projectId,
      role: PROJECT_MEMBERSHIP_ROLE.MEMBER,
      status: PROJECT_MEMBERSHIP_STATUS.PENDING,
    },
    { userId, staffId, memberName },
  );

  const docRef = doc(collection(db, COLLECTIONS.PROJECT_MEMBERSHIPS));
  const document = buildProjectMembershipFirestoreDocument(payload, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    joinedAt: null,
    deletedAt: null,
  });

  await setDoc(docRef, document);

  await createProjectUpdate(
    projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.MEMBER_REQUESTED,
      message: `${memberName || 'A member'} requested to join the project.`,
    },
    { role, createdByUserId: userId, createdByName: memberName },
  );

  await dispatchProjectJoinRequestNotification(project, { memberName, staffId });

  return {
    membership: { id: docRef.id, ...document },
  };
}

export async function approveMembershipRequest(
  membershipId,
  { role, userId = '', reviewerName = '', initialData = null, actorMembership = null } = {},
) {
  const existing = initialData || (await getMembership(membershipId, { role, userId }));
  const project = await loadProject(existing.projectId, { role, userId });

  assertCanApproveMembership(role, project, userId, actorMembership);

  if (!isProjectMembershipPending(existing)) {
    throw new Error('Only pending membership requests can be approved.');
  }

  const document = buildProjectMembershipFirestoreDocument(
    buildProjectMembershipPayload(
      {
        ...existing,
        status: PROJECT_MEMBERSHIP_STATUS.ACTIVE,
      },
      {
        userId: existing.userId,
        staffId: existing.staffId,
        memberName: existing.memberName,
      },
    ),
    {
      createdAt: existing.createdAt ?? null,
      updatedAt: serverTimestamp(),
      joinedAt: serverTimestamp(),
      deletedAt: null,
      reviewedAt: serverTimestamp(),
      reviewedByUserId: userId,
      reviewedByName: reviewerName,
    },
  );

  await updateDoc(doc(db, COLLECTIONS.PROJECT_MEMBERSHIPS, membershipId), {
    ...document,
    updatedAt: serverTimestamp(),
  });

  await incrementProjectMemberCount(existing.projectId, project, 1);

  await createProjectUpdate(
    existing.projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.MEMBER_APPROVED,
      message: `${existing.memberName || 'A member'} was approved to join the project.`,
    },
    { role, createdByUserId: userId, createdByName: reviewerName },
  );

  await notifyProjectJoinApproved({
    staffDocId: existing.staffId,
    project,
    reviewerName,
  }).catch((notificationError) => {
    console.error('Failed to send project join approved notification:', notificationError);
  });

  return {
    membership: { id: membershipId, ...document },
  };
}

export async function rejectMembershipRequest(
  membershipId,
  { role, userId = '', reviewerName = '', initialData = null, actorMembership = null } = {},
) {
  const existing = initialData || (await getMembership(membershipId, { role, userId }));
  const project = await loadProject(existing.projectId, { role, userId });

  assertCanRejectMembership(role, project, userId, actorMembership);

  if (!isProjectMembershipPending(existing)) {
    throw new Error('Only pending membership requests can be rejected.');
  }

  await updateDoc(doc(db, COLLECTIONS.PROJECT_MEMBERSHIPS, membershipId), {
    status: PROJECT_MEMBERSHIP_STATUS.REJECTED,
    reviewedAt: serverTimestamp(),
    reviewedByUserId: userId,
    reviewedByName: reviewerName,
    updatedAt: serverTimestamp(),
  });

  await createProjectUpdate(
    existing.projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.MEMBER_REJECTED,
      message: `${existing.memberName || 'A member'} was not approved to join the project.`,
    },
    { role, createdByUserId: userId, createdByName: reviewerName },
  );

  await notifyProjectJoinRejected({
    staffDocId: existing.staffId,
    project,
    reviewerName,
  }).catch((notificationError) => {
    console.error('Failed to send project join rejected notification:', notificationError);
  });

  return { membershipId };
}

export async function cancelJoinRequest(
  membershipId,
  { role, userId = '', initialData = null } = {},
) {
  const existing = initialData || (await getMembership(membershipId, { role, userId }));
  const project = await loadProject(existing.projectId, { role, userId });

  assertCanCancelJoinRequest(role, project, userId, existing);

  await updateDoc(doc(db, COLLECTIONS.PROJECT_MEMBERSHIPS, membershipId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { membershipId };
}

export async function inviteMemberToProject(
  projectId,
  { role, userId = '', staffId = '', memberName = '', currentUserId = '', actorMembership = null } = {},
) {
  const project = await loadProject(projectId, { role, userId: currentUserId });
  assertCanInviteMember(role, project, currentUserId, actorMembership);

  const existingMembership = await getMembershipForUser(projectId, userId, {
    role,
    currentUserId,
  });

  if (existingMembership && isProjectMembershipActive(existingMembership)) {
    throw new Error('This user is already a member of the project.');
  }

  if (existingMembership && isProjectMembershipPending(existingMembership)) {
    return approveMembershipRequest(existingMembership.id, {
      role,
      userId: currentUserId,
      reviewerName: memberName,
      initialData: existingMembership,
      actorMembership,
    });
  }

  const payload = buildProjectMembershipPayload(
    {
      projectId,
      role: PROJECT_MEMBERSHIP_ROLE.MEMBER,
      status: PROJECT_MEMBERSHIP_STATUS.ACTIVE,
    },
    { userId, staffId, memberName },
  );

  const validationMessage = validateProjectMembershipForm(payload);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  if (existingMembership && isProjectMembershipRejected(existingMembership)) {
    const document = buildProjectMembershipFirestoreDocument(payload, {
      createdAt: existingMembership.createdAt ?? null,
      updatedAt: serverTimestamp(),
      joinedAt: serverTimestamp(),
      deletedAt: null,
      reviewedAt: serverTimestamp(),
      reviewedByUserId: currentUserId,
      reviewedByName: memberName,
    });

    await updateDoc(doc(db, COLLECTIONS.PROJECT_MEMBERSHIPS, existingMembership.id), {
      ...document,
      updatedAt: serverTimestamp(),
    });

    await incrementProjectMemberCount(projectId, project, 1);

    return {
      membership: { id: existingMembership.id, ...document },
    };
  }

  const docRef = doc(collection(db, COLLECTIONS.PROJECT_MEMBERSHIPS));
  const document = buildProjectMembershipFirestoreDocument(payload, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    joinedAt: serverTimestamp(),
    deletedAt: null,
    reviewedAt: serverTimestamp(),
    reviewedByUserId: currentUserId,
    reviewedByName: memberName,
  });

  await setDoc(docRef, document);
  await incrementProjectMemberCount(projectId, project, 1);

  await createProjectUpdate(
    projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.MEMBER_JOINED,
      message: `${memberName || 'A member'} was invited to the project.`,
    },
    { role, createdByUserId: currentUserId, createdByName: memberName },
  );

  return {
    membership: { id: docRef.id, ...document },
  };
}

export async function leaveProject(
  membershipId,
  { role, userId = '', initialData = null, actorMembership = null } = {},
) {
  const existing = initialData || (await getMembership(membershipId, { role, userId }));
  const project = await loadProject(existing.projectId, { role, userId });

  if (String(existing.userId || '') === String(userId || '')) {
    assertCanLeaveProject(role, project, userId, existing);
  } else {
    assertCanRemoveMember(role, project, userId, actorMembership, existing);
  }

  const wasActive = isProjectMembershipActive(existing);

  await updateDoc(doc(db, COLLECTIONS.PROJECT_MEMBERSHIPS, membershipId), {
    status: PROJECT_MEMBERSHIP_STATUS.LEFT,
    updatedAt: serverTimestamp(),
    deletedAt: serverTimestamp(),
  });

  if (wasActive) {
    await incrementProjectMemberCount(existing.projectId, project, -1);
  }

  await createProjectUpdate(
    existing.projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.MEMBER_LEFT,
      message: `${existing.memberName || 'A member'} left the project.`,
    },
    { role, createdByUserId: userId, createdByName: existing.memberName },
  );

  return { membershipId };
}

export async function updateMembership(
  membershipId,
  formData,
  { role, userId = '', initialData = null, actorMembership = null } = {},
) {
  const existing = initialData || (await getMembership(membershipId, { role, userId }));
  const project = await loadProject(existing.projectId, { role, userId });
  assertCanManageProjectTeam(role, project, userId, actorMembership);

  const payload = buildProjectMembershipPayload(
    {
      ...existing,
      ...formData,
      projectId: existing.projectId,
      userId: existing.userId,
    },
    {
      staffId: existing.staffId,
      memberName: existing.memberName,
    },
  );

  const validationMessage = validateProjectMembershipForm(payload);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const document = buildProjectMembershipFirestoreDocument(payload, {
    createdAt: existing.createdAt ?? null,
    updatedAt: serverTimestamp(),
    joinedAt: existing.joinedAt ?? existing.createdAt ?? null,
    deletedAt: existing.deletedAt ?? null,
  });

  await updateDoc(doc(db, COLLECTIONS.PROJECT_MEMBERSHIPS, membershipId), {
    ...document,
    updatedAt: serverTimestamp(),
  });

  return {
    membership: { id: membershipId, ...document },
  };
}

export async function deleteMembership(
  membershipId,
  { role, userId = '', initialData = null } = {},
) {
  const existing = initialData || (await getMembership(membershipId, { role, userId }));
  const project = await loadProject(existing.projectId, { role, userId });
  assertCanManageProject(role, project, userId);

  await updateDoc(doc(db, COLLECTIONS.PROJECT_MEMBERSHIPS, membershipId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { membershipId };
}

export async function softDeleteMembershipsForProject(projectId) {
  const memberships = await getDocuments(COLLECTIONS.PROJECT_MEMBERSHIPS, [
    where('projectId', '==', projectId),
  ]);

  const timestamp = serverTimestamp();
  await Promise.all(
    memberships.map((membership) =>
      updateDoc(doc(db, COLLECTIONS.PROJECT_MEMBERSHIPS, membership.id), {
        deletedAt: timestamp,
        updatedAt: timestamp,
      })),
  );

  return memberships;
}

export async function removeMemberFromProject(
  membershipId,
  { role, userId = '', actorMembership = null, actorName = '' } = {},
) {
  const existing = await getMembership(membershipId, { role, userId });
  const project = await loadProject(existing.projectId, { role, userId });
  assertCanRemoveMember(role, project, userId, actorMembership, existing);

  return leaveProject(membershipId, {
    role,
    userId,
    initialData: existing,
    actorMembership,
  });
}

export async function assignProjectLeader(
  projectId,
  {
    role,
    userId = '',
    targetUserId = '',
    targetStaffId = '',
    targetName = '',
    actorName = '',
    actorMembership = null,
  } = {},
) {
  const project = await loadProject(projectId, { role, userId });
  assertCanAssignProjectLeader(role, project, userId, actorMembership);

  const targetMembership = await getMembershipForUser(projectId, targetUserId, {
    role,
    currentUserId: userId,
  });

  if (!targetMembership || !isProjectMembershipActive(targetMembership)) {
    throw new Error('Only active team members can be assigned as leader.');
  }

  const leaderName = targetName || targetMembership.memberName || '';
  const leaderStaffId = targetStaffId || targetMembership.staffId || '';

  await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
    leaderUserId: targetUserId,
    leaderStaffId,
    leaderName,
    updatedAt: serverTimestamp(),
  });

  if (targetMembership.role === PROJECT_MEMBERSHIP_ROLE.MEMBER) {
    await updateMembership(
      targetMembership.id,
      { role: PROJECT_MEMBERSHIP_ROLE.COORDINATOR },
      { role, userId, initialData: targetMembership, actorMembership },
    );
  }

  await createProjectUpdate(
    projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.LEADER_ASSIGNED,
      message: `${leaderName || 'A team member'} was assigned as project leader.`,
    },
    { role, createdByUserId: userId, createdByName: actorName },
  );

  await notifyProjectLeaderAssigned({
    staffDocId: leaderStaffId || targetMembership.staffId,
    project,
    assignerName: actorName,
  }).catch((notificationError) => {
    console.error('Failed to send project leader assigned notification:', notificationError);
  });

  return {
    leaderUserId: targetUserId,
    leaderStaffId,
    leaderName,
  };
}

export async function transferProjectLeadership(
  projectId,
  {
    role,
    userId = '',
    targetMembershipId = '',
    actorName = '',
    actorMembership = null,
  } = {},
) {
  const project = await loadProject(projectId, { role, userId });
  assertCanTransferProjectLeadership(role, project, userId, actorMembership);

  const targetMembership = await getMembership(targetMembershipId, { role, userId });

  if (!isProjectMembershipActive(targetMembership)) {
    throw new Error('Leadership can only be transferred to an active team member.');
  }

  if (targetMembership.role === PROJECT_MEMBERSHIP_ROLE.OWNER) {
    throw new Error('This member is already the project leader.');
  }

  const allMemberships = await listMembershipsForProject(projectId, { role, userId });
  const currentOwnerMembership = allMemberships.find(
    (membership) => membership.role === PROJECT_MEMBERSHIP_ROLE.OWNER
      && isProjectMembershipActive(membership),
  );

  if (currentOwnerMembership) {
    await updateMembership(
      currentOwnerMembership.id,
      { role: PROJECT_MEMBERSHIP_ROLE.COORDINATOR },
      { role, userId, initialData: currentOwnerMembership, actorMembership },
    );
  }

  await updateMembership(
    targetMembershipId,
    { role: PROJECT_MEMBERSHIP_ROLE.OWNER },
    { role, userId, initialData: targetMembership, actorMembership },
  );

  const leaderName = targetMembership.memberName || '';
  const leaderStaffId = targetMembership.staffId || '';

  await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
    leaderUserId: targetMembership.userId,
    leaderStaffId,
    leaderName,
    updatedAt: serverTimestamp(),
  });

  await createProjectUpdate(
    projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.LEADERSHIP_TRANSFERRED,
      message: `Project leadership was transferred to ${leaderName || 'a team member'}.`,
    },
    { role, createdByUserId: userId, createdByName: actorName },
  );

  return {
    leaderUserId: targetMembership.userId,
    leaderStaffId,
    leaderName,
  };
}

export function resolveLinkedMemberId(memberRow) {
  const directId = String(memberRow?.id || '').trim();
  if (directId) return directId;

  const rawId = String(memberRow?.raw?.id || '').trim();
  if (rawId) return rawId;

  return '';
}

export function warnMissingLinkedMemberId(memberRow, context = 'linked member row') {
  console.warn(`[MemberProfileModal] ${context} is missing a member ID.`, memberRow);
}

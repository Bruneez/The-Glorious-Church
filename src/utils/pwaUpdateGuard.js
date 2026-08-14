export function canApplyPwaUpdate({ hasDirtyForms = false } = {}) {
  return !hasDirtyForms;
}

export function shouldDeferPwaUpdate({ needRefresh = false, hasDirtyForms = false } = {}) {
  return Boolean(needRefresh && hasDirtyForms);
}

export function getPwaUpdateBlockedMessage() {
  return 'Finish or discard your open form changes before updating the app.';
}

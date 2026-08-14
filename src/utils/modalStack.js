const modalStack = [];

export function registerModal(modalId) {
  if (!modalId) {
    return () => {};
  }

  modalStack.push(modalId);

  return () => {
    const index = modalStack.lastIndexOf(modalId);
    if (index >= 0) {
      modalStack.splice(index, 1);
    }
  };
}

export function isTopModal(modalId) {
  if (!modalId || modalStack.length === 0) return false;
  return modalStack[modalStack.length - 1] === modalId;
}

export function hasOpenModals() {
  return modalStack.length > 0;
}

export function getOpenModalCount() {
  return modalStack.length;
}

export function resetModalStackForTests() {
  modalStack.length = 0;
}

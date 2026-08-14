export function getModalFormProps({ isSubmitting = false, isDirty = false } = {}) {
  return {
    variant: 'form',
    preventClose: isSubmitting,
    isDirty,
  };
}

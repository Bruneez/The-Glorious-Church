export const TRANSPORT_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const TRANSPORT_STATUS_OPTIONS = [
  { value: TRANSPORT_STATUS.ACTIVE, label: 'Active' },
  { value: TRANSPORT_STATUS.INACTIVE, label: 'Inactive' },
];

export function validateTransportForm(formData) {
  if (!formData.name?.trim()) {
    return 'Driver Name is required.';
  }

  if (!formData.phone?.trim()) {
    return 'Phone Number is required.';
  }

  if (!formData.vehicle?.trim()) {
    return 'Vehicle is required.';
  }

  if (!formData.route?.trim()) {
    return 'Route is required.';
  }

  if (formData.capacity === '' || formData.capacity === null || formData.capacity === undefined) {
    return 'Capacity is required.';
  }

  const capacity = parseInt(formData.capacity, 10);
  if (Number.isNaN(capacity) || capacity <= 0) {
    return 'Capacity must be greater than 0.';
  }

  if (!formData.status) {
    return 'Status is required.';
  }

  return '';
}

export function buildTransportPayload(formData, createdBy, existingRecord = null) {
  return {
    name: formData.name.trim(),
    phone: formData.phone.trim(),
    vehicle: formData.vehicle.trim(),
    route: formData.route.trim(),
    capacity: parseInt(formData.capacity, 10),
    status: formData.status,
    createdBy: existingRecord?.createdBy || createdBy,
  };
}

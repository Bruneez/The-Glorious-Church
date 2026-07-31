export const TRANSPORT_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const TRANSPORT_STATUS_OPTIONS = [
  { value: TRANSPORT_STATUS.ACTIVE, label: 'Active' },
  { value: TRANSPORT_STATUS.INACTIVE, label: 'Inactive' },
];

export const ACCEPTED_TRANSPORT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ACCEPTED_TRANSPORT_IMAGE_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export const MAX_TRANSPORT_IMAGE_BYTES = 5 * 1024 * 1024;

export const TRANSPORT_IMAGE_UPLOAD_TIMEOUT_MS = 30_000;

export function validateTransportImageFile(file) {
  if (!file) return '';

  if (file.size > MAX_TRANSPORT_IMAGE_BYTES) {
    return 'Photo must be 5 MB or smaller.';
  }

  const hasAllowedType = ACCEPTED_TRANSPORT_IMAGE_TYPES.includes(file.type);
  const hasAllowedExtension = /\.(jpe?g|png|webp)$/i.test(file.name || '');

  if (!hasAllowedType && !hasAllowedExtension) {
    return 'Please upload a JPG, PNG, or WEBP image.';
  }

  return '';
}

export function resolveTransportImageContentType(file) {
  if (!file) return null;

  const fileType = String(file.type || '').trim().toLowerCase();
  if (ACCEPTED_TRANSPORT_IMAGE_TYPES.includes(fileType)) {
    return fileType;
  }

  const extension = String(file.name || '').match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';

  return null;
}

export function isPermanentTransportImageUrl(url) {
  const value = String(url || '').trim();
  if (!value) return false;
  return !value.startsWith('blob:') && !value.startsWith('data:');
}

export function mapTransportToFormData(record) {
  if (!record || typeof record !== 'object') {
    return {
      name: '',
      phone: '',
      vehicle: '',
      route: '',
      capacity: '',
      status: TRANSPORT_STATUS.ACTIVE,
      vehicleImageUrl: '',
      vehicleImageStoragePath: '',
    };
  }

  return {
    name: record.name || '',
    phone: record.phone || '',
    vehicle: record.vehicle || record.vehicleReg || '',
    route: record.route || '',
    capacity: record.capacity ?? '',
    status: record.status || TRANSPORT_STATUS.ACTIVE,
    vehicleImageUrl: isPermanentTransportImageUrl(getVehicleImage(record))
      ? getVehicleImage(record)
      : '',
    vehicleImageStoragePath: String(record.vehicleImageStoragePath || '').trim(),
  };
}

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
  const vehicleImageUrl = isPermanentTransportImageUrl(formData.vehicleImageUrl)
    ? String(formData.vehicleImageUrl).trim()
    : '';
  const vehicleImageStoragePath = String(formData.vehicleImageStoragePath || '').trim();

  return {
    name: formData.name.trim(),
    phone: formData.phone.trim(),
    vehicle: formData.vehicle.trim(),
    route: formData.route.trim(),
    capacity: parseInt(formData.capacity, 10),
    status: formData.status,
    vehicleImageUrl,
    vehicleImageStoragePath,
    createdBy: existingRecord?.createdBy || createdBy,
  };
}

export function getDriverVehicle(driver) {
  return driver?.vehicle || driver?.vehicleReg || '';
}

export function getVehicleImage(driver) {
  return (
    driver?.vehicleImageUrl
    || driver?.vehicleImage
    || driver?.vehiclePhoto
    || driver?.photo
    || driver?.image
    || ''
  );
}

export function computeTransportStats(drivers = []) {
  const activeDrivers = drivers.filter((driver) => driver.status === TRANSPORT_STATUS.ACTIVE);
  const totalCapacity = drivers.reduce((sum, driver) => {
    const capacity = parseInt(driver.capacity, 10);
    return sum + (Number.isNaN(capacity) ? 0 : capacity);
  }, 0);
  const uniqueRoutes = new Set(
    drivers.map((driver) => driver.route?.trim()).filter(Boolean),
  );

  return {
    totalDrivers: drivers.length,
    activeDrivers: activeDrivers.length,
    totalCapacity,
    totalRoutes: uniqueRoutes.size,
  };
}

/** Normalizes a latitude/longitude value for Firestore storage. */
export function normalizeMemberCoordinate(value) {
  if (value === '' || value == null) return null;

  const number = Number(value);
  if (Number.isNaN(number)) return null;

  return number;
}

function normalizeMemberCoords(latitude, longitude) {
  const lat = normalizeMemberCoordinate(latitude);
  const lng = normalizeMemberCoordinate(longitude);

  if (lat == null || lng == null) {
    return null;
  }

  return [lat, lng];
}

/** Builds a nested location object for Firestore (`homeLocation` / `workLocation`). */
export function buildMemberLocationObject(address = '', latitude = null, longitude = null) {
  const fullAddress = String(address || '').trim();
  const lat = normalizeMemberCoordinate(latitude);
  const lng = normalizeMemberCoordinate(longitude);

  if (!fullAddress && lat == null && lng == null) {
    return null;
  }

  return {
    fullAddress,
    latitude: lat,
    longitude: lng,
  };
}

export function getMemberHomeAddress(member) {
  return (
    member?.homeAddress
    || member?.homeLocation?.fullAddress
    || member?.fullAddress
    || member?.address
    || ''
  ).trim();
}

export function getMemberWorkAddress(member) {
  return (member?.workLocation?.fullAddress || member?.workAddress || '').trim();
}

/** Resolves stored home coordinates from a member record. */
export function getMemberHomeCoords(member) {
  const fromHomeLocation = member?.homeLocation
    ? normalizeMemberCoords(
      member.homeLocation.latitude,
      member.homeLocation.longitude,
    )
    : null;

  if (fromHomeLocation) {
    return fromHomeLocation;
  }

  return normalizeMemberCoords(
    member?.latitude ?? member?.lat,
    member?.longitude ?? member?.lng,
  );
}

/** Resolves stored work coordinates from a working member record. */
export function getMemberWorkCoords(member) {
  const fromWorkLocation = member?.workLocation
    ? normalizeMemberCoords(
      member.workLocation.latitude,
      member.workLocation.longitude,
    )
    : null;

  if (fromWorkLocation) {
    return fromWorkLocation;
  }

  return normalizeMemberCoords(member?.workLatitude, member?.workLongitude);
}

export function memberHasPlottableHomeLocation(member) {
  return Boolean(getMemberHomeCoords(member));
}

export function memberHasPlottableWorkLocation(member) {
  return Boolean(getMemberWorkCoords(member));
}

export function buildMemberHomeLocationFields(formData = {}) {
  const fullAddress = (
    formData.homeAddress
    || formData.fullAddress
    || formData.address
    || ''
  ).trim();
  const latitude = normalizeMemberCoordinate(
    formData.homeLocation?.latitude ?? formData.latitude,
  );
  const longitude = normalizeMemberCoordinate(
    formData.homeLocation?.longitude ?? formData.longitude,
  );
  const homeLocation = buildMemberLocationObject(fullAddress, latitude, longitude);

  return {
    homeAddress: fullAddress,
    homeLocation,
    address: fullAddress,
    fullAddress,
    latitude,
    longitude,
  };
}

export function buildMemberWorkLocationFields(formData = {}) {
  const workAddress = (
    formData.workLocation?.fullAddress
    || formData.workAddress
    || ''
  ).trim();
  const workLatitude = normalizeMemberCoordinate(
    formData.workLocation?.latitude ?? formData.workLatitude,
  );
  const workLongitude = normalizeMemberCoordinate(
    formData.workLocation?.longitude ?? formData.workLongitude,
  );
  const workLocation = buildMemberLocationObject(workAddress, workLatitude, workLongitude);

  return {
    workAddress,
    workLocation,
    workLatitude,
    workLongitude,
  };
}

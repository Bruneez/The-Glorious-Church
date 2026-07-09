import { uploadImage, uploadFile, deleteFile } from '@/hooks/useStorage';

export async function uploadMemberPhoto(file) {
  return uploadImage(file, 'member-photos');
}

export async function uploadStaffPhoto(file) {
  return uploadImage(file, 'staff-photos');
}

export async function uploadSchoolBadge(file) {
  const timestamp = Date.now();
  const safeName = String(file.name || 'badge').replace(/[^\w.-]/g, '_');
  const badgePath = `school-logos/${timestamp}_${safeName}`;
  const badgeUrl = await uploadFile(file, badgePath);

  return { badgeUrl, badgePath };
}

export async function uploadSchoolLogo(file) {
  const { badgeUrl } = await uploadSchoolBadge(file);
  return badgeUrl;
}

export async function uploadEventImage(file) {
  return uploadImage(file, 'event-images');
}

export async function uploadCreativeArtsLogo(file) {
  const timestamp = Date.now();
  const safeName = String(file.name || 'logo').replace(/[^\w.-]/g, '_');
  const logoPath = `creative-arts-images/${timestamp}_${safeName}`;
  const logoUrl = await uploadFile(file, logoPath);

  return { logoUrl, logoPath };
}

export async function uploadCreativeArtsImage(file) {
  const { logoUrl } = await uploadCreativeArtsLogo(file);
  return logoUrl;
}

export async function uploadMinistryAvatar(file) {
  const timestamp = Date.now();
  const safeName = String(file.name || 'avatar').replace(/[^\w.-]/g, '_');
  const avatarPath = `ministry-avatars/${timestamp}_${safeName}`;
  const avatarUrl = await uploadFile(file, avatarPath);

  return { avatarUrl, avatarPath };
}

export async function deleteMemberPhoto(path) {
  return deleteFile(path);
}

export async function deleteStaffPhoto(path) {
  return deleteFile(path);
}

export async function deleteSchoolLogo(path) {
  return deleteFile(path);
}

export async function deleteEventImage(path) {
  return deleteFile(path);
}

export async function deleteCreativeArtsImage(path) {
  return deleteFile(path);
}

export async function deleteMinistryAvatar(path) {
  return deleteFile(path);
}

import { uploadImage, deleteFile } from '@/hooks/useStorage';

export async function uploadMemberPhoto(file) {
  return uploadImage(file, 'member-photos');
}

export async function uploadStaffPhoto(file) {
  return uploadImage(file, 'staff-photos');
}

export async function uploadSchoolLogo(file) {
  return uploadImage(file, 'school-logos');
}

export async function uploadEventImage(file) {
  return uploadImage(file, 'event-images');
}

export async function uploadCreativeArtsImage(file) {
  return uploadImage(file, 'creative-arts-images');
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

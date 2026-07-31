import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractStoragePathFromDownloadUrl,
  resolveCreativeArtsLogoStoragePath,
  resolveMemberPhotoStoragePath,
  resolveMemberReportCardStoragePath,
  resolveMinistryAvatarStoragePath,
  resolveSchoolBadgeStoragePath,
  resolveTravelDestinationImageStoragePath,
  resolveShepherdingCoverStoragePath,
  resolveAppFixAttachmentStoragePath,
  resolveProjectAttachmentStoragePath,
  resolveProjectCoverStoragePath,
} from './storagePathUtils.js';

test('extractStoragePathFromDownloadUrl decodes Firebase download URLs', () => {
  const url =
    'https://firebasestorage.googleapis.com/v0/b/the-glorious-church.firebasestorage.app/o/member-photos%2F1712345678_photo.jpg?alt=media&token=abc';

  assert.equal(
    extractStoragePathFromDownloadUrl(url),
    'member-photos/1712345678_photo.jpg',
  );
});

test('resolveMemberPhotoStoragePath prefers profileImagePath over photo URL', () => {
  assert.equal(
    resolveMemberPhotoStoragePath({
      profileImagePath: 'member-photos/123_photo.jpg',
      photo: 'https://example.com/other.jpg',
    }),
    'member-photos/123_photo.jpg',
  );
});

test('resolveMemberPhotoStoragePath falls back to photo URL when path missing', () => {
  const url =
    'https://firebasestorage.googleapis.com/v0/b/the-glorious-church.firebasestorage.app/o/member-photos%2F999_photo.webp?alt=media&token=abc';

  assert.equal(
    resolveMemberPhotoStoragePath({
      profileImagePath: '',
      photo: url,
    }),
    'member-photos/999_photo.webp',
  );
});

test('resolveMemberPhotoStoragePath treats null and undefined members as empty', () => {
  assert.equal(resolveMemberPhotoStoragePath(null), '');
  assert.equal(resolveMemberPhotoStoragePath(undefined), '');
});

test('resolveMemberReportCardStoragePath treats null members as empty', () => {
  assert.equal(resolveMemberReportCardStoragePath(null), '');
  assert.equal(resolveMemberReportCardStoragePath(undefined), '');
});

test('resolveSchoolBadgeStoragePath prefers badgePath', () => {
  assert.equal(
    resolveSchoolBadgeStoragePath({
      badgePath: 'school-logos/123_badge.jpg',
      badgeUrl: 'https://example.com/other.jpg',
    }),
    'school-logos/123_badge.jpg',
  );
});

test('resolveSchoolBadgeStoragePath resolves Firebase Storage path from badgeUrl', () => {
  const url =
    'https://firebasestorage.googleapis.com/v0/b/the-glorious-church.firebasestorage.app/o/school-logos%2F999_badge.webp?alt=media&token=abc';

  assert.equal(
    resolveSchoolBadgeStoragePath({
      badgePath: '',
      badgeUrl: url,
    }),
    'school-logos/999_badge.webp',
  );
});

test('resolveSchoolBadgeStoragePath ignores external URLs', () => {
  assert.equal(
    resolveSchoolBadgeStoragePath({
      badgePath: '',
      badgeUrl: '',
      logo: 'https://example.com/external-logo.png',
    }),
    '',
  );
});

test('resolveSchoolBadgeStoragePath ignores blob and data URLs', () => {
  assert.equal(
    resolveSchoolBadgeStoragePath({
      badgePath: '',
      badgeUrl: 'blob:http://localhost/fake-preview',
      logo: 'data:image/png;base64,abc123',
    }),
    '',
  );
});

test('resolveCreativeArtsLogoStoragePath prefers logoPath', () => {
  assert.equal(
    resolveCreativeArtsLogoStoragePath({
      logoPath: 'creative-arts-images/1712345678_choir.jpg',
      logoUrl: 'https://example.com/other.jpg',
    }),
    'creative-arts-images/1712345678_choir.jpg',
  );
});

test('resolveCreativeArtsLogoStoragePath resolves Firebase Storage path from logoUrl', () => {
  const url =
    'https://firebasestorage.googleapis.com/v0/b/the-glorious-church.firebasestorage.app/o/creative-arts-images%2F999_logo.webp?alt=media&token=abc';

  assert.equal(
    resolveCreativeArtsLogoStoragePath({
      logoPath: '',
      logoUrl: url,
    }),
    'creative-arts-images/999_logo.webp',
  );
});

test('resolveCreativeArtsLogoStoragePath ignores blob preview URLs', () => {
  assert.equal(
    resolveCreativeArtsLogoStoragePath({
      logoPath: '',
      logoUrl: 'blob:http://localhost/fake-preview',
      photo: 'blob:http://localhost/fake-preview',
    }),
    '',
  );
});

test('resolveCreativeArtsLogoStoragePath ignores external URLs', () => {
  assert.equal(
    resolveCreativeArtsLogoStoragePath({
      logoPath: '',
      logoUrl: 'https://example.com/external-logo.png',
    }),
    '',
  );
});

test('resolveMinistryAvatarStoragePath prefers avatarPath', () => {
  assert.equal(
    resolveMinistryAvatarStoragePath({
      avatarPath: 'ministry-avatars/1712345678_ushering.jpg',
      avatarUrl: 'https://example.com/other.jpg',
    }),
    'ministry-avatars/1712345678_ushering.jpg',
  );
});

test('resolveMinistryAvatarStoragePath resolves Firebase Storage path from avatarUrl', () => {
  const url =
    'https://firebasestorage.googleapis.com/v0/b/the-glorious-church.firebasestorage.app/o/ministry-avatars%2F999_avatar.webp?alt=media&token=abc';

  assert.equal(
    resolveMinistryAvatarStoragePath({
      avatarPath: '',
      avatarUrl: url,
    }),
    'ministry-avatars/999_avatar.webp',
  );
});

test('resolveMinistryAvatarStoragePath ignores blob preview URLs', () => {
  assert.equal(
    resolveMinistryAvatarStoragePath({
      avatarPath: '',
      avatarUrl: 'blob:http://localhost/fake-preview',
    }),
    '',
  );
});

test('resolveTravelDestinationImageStoragePath prefers imageStoragePath', () => {
  assert.equal(
    resolveTravelDestinationImageStoragePath({
      imageStoragePath: 'travel-destinations/abc123/1712345678_paris.jpg',
      imageUrl: 'https://example.com/other.jpg',
    }),
    'travel-destinations/abc123/1712345678_paris.jpg',
  );
});

test('resolveTravelDestinationImageStoragePath resolves Firebase Storage path from imageUrl', () => {
  const url =
    'https://firebasestorage.googleapis.com/v0/b/the-glorious-church.firebasestorage.app/o/travel-destinations%2Fabc123%2F999_image.webp?alt=media&token=abc';

  assert.equal(
    resolveTravelDestinationImageStoragePath({
      imageStoragePath: '',
      imageUrl: url,
    }),
    'travel-destinations/abc123/999_image.webp',
  );
});

test('resolveTravelDestinationImageStoragePath ignores blob preview URLs', () => {
  assert.equal(
    resolveTravelDestinationImageStoragePath({
      imageStoragePath: '',
      imageUrl: 'blob:http://localhost/fake-preview',
    }),
    '',
  );
});

test('resolveTravelDestinationImageStoragePath safely handles null records when adding a location', () => {
  assert.equal(resolveTravelDestinationImageStoragePath(null), '');
  assert.equal(resolveTravelDestinationImageStoragePath(undefined), '');
});

test('resolveShepherdingCoverStoragePath prefers coverImageStoragePath', () => {
  assert.equal(
    resolveShepherdingCoverStoragePath({
      coverImageStoragePath: 'shepherding-tools/abc123/123_cover.jpg',
      coverImageUrl: 'https://example.com/other.jpg',
    }),
    'shepherding-tools/abc123/123_cover.jpg',
  );
});

test('resolveShepherdingCoverStoragePath safely handles null and undefined records', () => {
  assert.equal(resolveShepherdingCoverStoragePath(null), '');
  assert.equal(resolveShepherdingCoverStoragePath(undefined), '');
});

test('resolveShepherdingCoverStoragePath resolves Firebase Storage path from coverImageUrl', () => {
  const url =
    'https://firebasestorage.googleapis.com/v0/b/the-glorious-church.firebasestorage.app/o/shepherding-tools%2Fabc123%2F999_cover.webp?alt=media&token=abc';

  assert.equal(
    resolveShepherdingCoverStoragePath({
      coverImageStoragePath: '',
      coverImageUrl: url,
    }),
    'shepherding-tools/abc123/999_cover.webp',
  );
});

test('resolveAppFixAttachmentStoragePath prefers fileStoragePath over fileUrl', () => {
  assert.equal(
    resolveAppFixAttachmentStoragePath({
      fileStoragePath: 'app-fixes/req-1/123_screen.png',
      fileUrl: 'https://example.com/other.png',
    }),
    'app-fixes/req-1/123_screen.png',
  );
});

test('resolveProjectCoverStoragePath prefers coverStoragePath over coverUrl', () => {
  assert.equal(
    resolveProjectCoverStoragePath({
      coverStoragePath: 'projects/proj-1/cover/123_cover.webp',
      coverUrl: 'https://example.com/other.webp',
    }),
    'projects/proj-1/cover/123_cover.webp',
  );
});

test('resolveProjectAttachmentStoragePath prefers fileStoragePath over fileUrl', () => {
  assert.equal(
    resolveProjectAttachmentStoragePath({
      fileStoragePath: 'projects/proj-1/attachments/123_brief.pdf',
      fileUrl: 'https://example.com/other.pdf',
    }),
    'projects/proj-1/attachments/123_brief.pdf',
  );
});

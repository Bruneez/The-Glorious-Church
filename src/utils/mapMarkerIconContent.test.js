import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP_MARKER_TYPES } from '../config/mapOptions.js';
import { resolveMapMarkerInnerContent } from './mapMarkerIconContent.js';

test('school badge is displayed inside the map pin when available', () => {
  const { innerContent, useLightBackground } = resolveMapMarkerInnerContent({
    type: MAP_MARKER_TYPES.SCHOOL,
    label: 'PS',
    data: {
      logo: 'https://example.com/badge.png',
    },
  });

  assert.match(innerContent, /<img src="https:\/\/example.com\/badge.png"/);
  assert.equal(useLightBackground, true);
});

test('school initials are shown when badge is missing', () => {
  const { innerContent, useLightBackground } = resolveMapMarkerInnerContent({
    type: MAP_MARKER_TYPES.SCHOOL,
    label: 'HS',
    data: {},
  });

  assert.equal(innerContent, 'HS');
  assert.equal(useLightBackground, false);
});

test('school initials are restored when badge fails to load', () => {
  const { innerContent } = resolveMapMarkerInnerContent({
    type: MAP_MARKER_TYPES.SCHOOL,
    label: 'UC',
    data: {
      logo: 'https://example.com/missing-badge.png',
    },
  });

  assert.match(innerContent, /onerror=/);
  assert.match(innerContent, /outerHTML='UC'/);
});

test('existing member home markers remain unchanged when photo is available', () => {
  const { innerContent } = resolveMapMarkerInnerContent({
    type: MAP_MARKER_TYPES.MEMBER,
    label: 'JD',
    data: {
      photo: 'https://example.com/member.jpg',
    },
  });

  assert.match(innerContent, /<img src="https:\/\/example.com\/member.jpg"/);
  assert.doesNotMatch(innerContent, /onerror=/);
});

test('existing member home markers still fall back to initials without a photo', () => {
  const { innerContent } = resolveMapMarkerInnerContent({
    type: MAP_MARKER_TYPES.MEMBER,
    label: 'JD',
    data: {},
  });

  assert.equal(innerContent, 'JD');
});

test('existing member work markers remain unchanged', () => {
  const { innerContent } = resolveMapMarkerInnerContent({
    type: MAP_MARKER_TYPES.MEMBER_WORK,
    label: 'W',
    data: {},
  });

  assert.equal(innerContent, '💼');
});

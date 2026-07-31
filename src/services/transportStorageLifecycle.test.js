import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldCleanupPreviousTransportVehicleImage,
  resolvePreviousTransportVehicleImagePath,
} from './transportStorageLifecycle.js';

test('shouldCleanupPreviousTransportVehicleImage only cleans replaced paths', () => {
  assert.equal(
    shouldCleanupPreviousTransportVehicleImage('transport/a/old.jpg', 'transport/a/new.jpg'),
    true,
  );
  assert.equal(
    shouldCleanupPreviousTransportVehicleImage('transport/a/old.jpg', 'transport/a/old.jpg'),
    false,
  );
  assert.equal(shouldCleanupPreviousTransportVehicleImage('', 'transport/a/new.jpg'), false);
});

test('resolvePreviousTransportVehicleImagePath prefers explicit previousImagePath', () => {
  assert.equal(
    resolvePreviousTransportVehicleImagePath(
      { previousImagePath: 'transport/a/old.jpg' },
      { vehicleImageStoragePath: 'transport/a/current.jpg' },
    ),
    'transport/a/old.jpg',
  );
});

test('resolvePreviousTransportVehicleImagePath resolves from initialData safely when null', () => {
  assert.equal(resolvePreviousTransportVehicleImagePath({}, null), '');
});

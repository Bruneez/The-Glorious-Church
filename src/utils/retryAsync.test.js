import test from 'node:test';
import assert from 'node:assert/strict';
import { retryAsync } from './retryAsync.js';

test('retryAsync returns the callback result on first success', async () => {
  let attempts = 0;

  const result = await retryAsync(async () => {
    attempts += 1;
    return 'ok';
  });

  assert.equal(result, 'ok');
  assert.equal(attempts, 1);
});

test('retryAsync retries until success', async () => {
  let attempts = 0;

  const result = await retryAsync(async () => {
    attempts += 1;
    if (attempts < 3) {
      throw new Error('temporary failure');
    }
    return 'recovered';
  }, { retries: 3, delayMs: 0 });

  assert.equal(result, 'recovered');
  assert.equal(attempts, 3);
});

test('retryAsync throws the last error after exhausting retries', async () => {
  await assert.rejects(
    () => retryAsync(async () => {
      throw new Error('permanent failure');
    }, { retries: 1, delayMs: 0 }),
    /permanent failure/,
  );
});

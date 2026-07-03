import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { app } from '@/config/firebase';

const functions = getFunctions(app);

const useEmulator =
  import.meta.env.DEV && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true';

if (useEmulator) {
  const host = import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST || '127.0.0.1';
  const port = Number(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT || 5001);
  connectFunctionsEmulator(functions, host, port);
}

export function getCreateStaffUserErrorMessage(error) {
  const code = error?.code || '';
  const message = error?.message || '';

  if (code === 'functions/unauthenticated') {
    return 'You must be signed in to create staff users.';
  }
  if (code === 'functions/permission-denied') {
    return 'Only Admin or Pastor accounts can create staff users.';
  }
  if (code === 'functions/already-exists') {
    return message || 'An account with this email already exists.';
  }
  if (code === 'functions/invalid-argument') {
    return message || 'Please check the staff details and try again.';
  }
  if (code === 'functions/unavailable' || code === 'functions/deadline-exceeded') {
    return 'Staff provisioning is unavailable right now. Deploy Cloud Functions and try again.';
  }
  if (code === 'functions/internal') {
    return message || 'Failed to create staff user. Please try again.';
  }

  return message || 'Failed to create staff user. Please try again.';
}

export async function createStaffUser(staffData) {
  const createStaffUserFn = httpsCallable(functions, 'createStaffUser');
  const result = await createStaffUserFn(staffData);
  return result.data;
}

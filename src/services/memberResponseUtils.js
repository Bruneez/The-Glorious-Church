export function normalizeMemberResponse(response) {
  if (!response) return null;

  if (response.member && typeof response.member === 'object') {
    return response.member;
  }

  if (response.data?.member && typeof response.data.member === 'object') {
    return response.data.member;
  }

  if (response.data && typeof response.data === 'object' && response.data.id) {
    return response.data;
  }

  if (response.id) {
    return response;
  }

  return null;
}

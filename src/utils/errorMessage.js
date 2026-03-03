export const getErrorMessage = (error) => {
  const apiMessage = error?.response?.data?.message;
  const apiErrors = error?.response?.data?.errors;
  const fallback = error?.message || 'Something went wrong. Please try again.';

  if (Array.isArray(apiErrors) && apiErrors.length > 0) {
    return apiErrors.join(', ');
  }

  if (Array.isArray(apiMessage)) {
    return apiMessage.join(', ');
  }

  return apiMessage || fallback;
};

export const getUserId = (userLike) => {
  if (!userLike) return '';
  return userLike._id || userLike.id || userLike.userId || '';
};

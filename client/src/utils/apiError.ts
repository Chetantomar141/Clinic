export const getApiErrorMessage = (error: unknown, fallback = 'Request failed. Please try again.') => {
  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  const maybeAxiosError = error as {
    response?: {
      data?: {
        error?: unknown;
        message?: unknown;
      };
    };
  };

  const serverMessage = maybeAxiosError.response?.data?.message ?? maybeAxiosError.response?.data?.error;

  if (typeof serverMessage === 'string') {
    return serverMessage;
  }

  if (serverMessage && typeof serverMessage === 'object') {
    return JSON.stringify(serverMessage);
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

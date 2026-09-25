const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getStatusCode = (error) => {
  return (
    error?.status ||
    error?.statusCode ||
    error?.response?.status ||
    error?.code
  );
};

const isRetryableGeminiError = (error) => {
  const statusCode = getStatusCode(error);

  return (
    statusCode === 408 ||

    (typeof statusCode === "number" &&
      statusCode >= 500 &&
      statusCode < 600)
  );
};

export const isGeminiQuotaError = (error) => {
  return getStatusCode(error) === 429;
};

export const generateContentWithRetry = async (
  generateRequest,
  options = {}
) => {
  const {
    maxRetries = 2,
    baseDelay = 2000,
    maxDelay = 10000,
    jitterMax = 1000,
  } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateRequest();
    } catch (error) {
      const statusCode = getStatusCode(error);
      const isLastAttempt = attempt === maxRetries;

      if (
        isLastAttempt ||
        !isRetryableGeminiError(error)
      ) {
        throw error;
      }

      const exponentialDelay = Math.min(
        baseDelay * 2 ** attempt,
        maxDelay
      );

      const jitter = Math.floor(
        Math.random() * jitterMax
      );

      const delay = exponentialDelay + jitter;

      console.warn(
        `Gemini temporary error (${statusCode}). ` +
        `Retry ${attempt + 1}/${maxRetries} ` +
        `in ${delay}ms...`
      );

      await sleep(delay);
    }
  }
};
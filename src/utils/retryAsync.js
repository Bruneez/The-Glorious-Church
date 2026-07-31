export async function retryAsync(callback, { retries = 2, delayMs = 400 } = {}) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await callback(attempt);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => {
          setTimeout(resolve, delayMs * (attempt + 1));
        });
      }
    }
  }

  throw lastError;
}

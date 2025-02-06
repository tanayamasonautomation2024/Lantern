// errorHandling.js

import { TimeoutError } from '../utils/errorHandler';

async function expectWithTimeoutHandling(action, description) {
  try {
    await action();
  } catch (error) {
    if (error.message.includes('waiting for expect(')) {
      const timeoutError = new TimeoutError(
        `Timeout error while waiting for ${description}`
      );
      throw timeoutError;
    } else {
      throw error;
    }
  }
}

export { expectWithTimeoutHandling };

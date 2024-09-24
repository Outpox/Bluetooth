import { customizeDecorator } from 'ts-retry-promise';
import { TimeoutError } from './backend/errors';

export function i18n(key: string) {
  const val = LocalizationManager.m_mapTokens.get(key);
  return val ? val : LocalizationManager.m_mapFallbackTokens.get(key)!;
}

export const retryWithTO = <T>(fn: () => Promise<T>) => {
  const timeout = customizeDecorator({ timeout: 2000 });
  const retry = customizeDecorator({ retries: 2 });

  return retry(timeout(fn))().catch(error => {
    if (error.message.includes('Timeout')) {
      throw new TimeoutError('Timeout');
    }
    throw error;
  });
};

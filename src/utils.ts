import { customizeDecorator } from 'ts-retry-promise';
import { TimeoutError } from './backend/errors';

declare const LocalizationManager: {
  m_mapTokens: Map<string, string>;
  m_mapFallbackTokens: Map<string, string>;
};

export function i18n(key: string, fallback?: string) {
  const val = LocalizationManager.m_mapTokens.get(key) ?? LocalizationManager.m_mapFallbackTokens.get(key);
  return val ?? fallback ?? key;
}

export const retryWithTO = <T>(fn: () => Promise<T>): Promise<T> => {
  const timeout = customizeDecorator({ timeout: 2000 });
  const retry = customizeDecorator({ retries: 2 });

  return retry(timeout(fn))().catch(error => {
    if (error.message.includes('Timeout')) {
      throw new TimeoutError('Timeout');
    }
    throw error;
  });
};

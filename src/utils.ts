import { retryDecorator } from 'ts-retry-promise';
import { TimeoutError } from './backend/errors';

declare const LocalizationManager: {
  m_mapTokens: Map<string, string>;
  m_mapFallbackTokens: Map<string, string>;
};

export function i18n(key: string, fallback?: string) {
  const val = LocalizationManager.m_mapTokens.get(key) ?? LocalizationManager.m_mapFallbackTokens.get(key);
  return val ?? fallback ?? key;
}

interface RetryOptions {
  /** Overall budget for every attempt, in milliseconds. */
  timeout?: number;
  /** Extra attempts after the first one. 0 means a single attempt. */
  retries?: number;
}

export const retryWithTO = <T>(fn: () => Promise<T>, { timeout = 2000, retries = 2 }: RetryOptions = {}): Promise<T> =>
  retryDecorator(fn, { timeout, retries })().catch(error => {
    if (error.message.includes('Timeout')) {
      throw new TimeoutError('Timeout');
    }
    throw error;
  });

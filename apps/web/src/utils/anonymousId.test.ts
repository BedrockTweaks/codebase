import { getAnonymousId } from '@/utils/anonymousId';
import { afterEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'bt-anonymous-id';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  // Drops any own property shadowing Crypto.prototype.randomUUID.
  Reflect.deleteProperty(crypto, 'randomUUID');
});

describe('getAnonymousId', () => {
  it('persists the id it creates on a first visit', () => {
    const id = getAnonymousId();

    expect(id).toBeTruthy();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(id);
  });

  it('returns the same id on a later visit', () => {
    expect(getAnonymousId()).toBe(getAnonymousId());
  });

  it('reuses an id already in storage', () => {
    window.localStorage.setItem(STORAGE_KEY, 'existing-id');

    expect(getAnonymousId()).toBe('existing-id');
  });

  it('still returns an id when storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });

    expect(getAnonymousId()).toBeTruthy();
  });

  it('still returns an id when storage cannot be written', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(getAnonymousId()).toBeTruthy();
  });

  it('falls back to getRandomValues where randomUUID is missing', () => {
    // randomUUID lives on Crypto.prototype, so an own undefined property is what
    // models the older webviews that do not implement it.
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });

    expect(getAnonymousId()).toMatch(/^[0-9a-f]{32}$/);
  });
});

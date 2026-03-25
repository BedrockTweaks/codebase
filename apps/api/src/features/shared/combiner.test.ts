import { describe, expect, it } from 'vitest';
import { deepMerge } from './combiner';

describe('deepMerge', () => {
  it('should merge two simple objects', () => {
    const source = { a: 1, b: 2 };
    const target = { b: 3, c: 4 };
    const result = deepMerge(source, target);

    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should merge arrays uniquely', () => {
    const source = [1, 2, 3];
    const target = [3, 4, 5];
    const result = deepMerge(source, target);

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should override format_version key', () => {
    const source = { format_version: 1, data: 'old' };
    const target = { format_version: 2, data: 'new' };
    const result = deepMerge(source, target);

    expect(result.format_version).toBe(2);
  });

  it('should deep merge nested objects', () => {
    const source = { a: { b: 1, c: 2 } };
    const target = { a: { c: 3, d: 4 } };
    const result = deepMerge(source, target);

    expect(result).toEqual({ a: { b: 1, c: 3, d: 4 } });
  });

  it('should return target when source is null', () => {
    const result = deepMerge(null, { a: 1 });

    expect(result).toEqual({ a: 1 });
  });

  it('should return target when source is not an object', () => {
    const result = deepMerge(42, { a: 1 });

    expect(result).toEqual({ a: 1 });
  });

  it('should return target when types mismatch (array vs object)', () => {
    const source = [1, 2, 3];
    const target = { a: 1 };
    const result = deepMerge(source, target);

    expect(result).toEqual({ a: 1 });
  });

  it('should merge arrays of objects uniquely', () => {
    const source = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];
    const target = [{ id: 2, name: 'b' }, { id: 3, name: 'c' }];
    const result = deepMerge(source, target);

    expect(result).toEqual([
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 3, name: 'c' },
    ]);
  });
});

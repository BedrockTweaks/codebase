import { resolveDownloadFileName } from '@/utils/packs';
import { describe, expect, it } from 'vitest';

describe('resolveDownloadFileName', () => {
  it('takes the file name from an absolute URL', () => {
    expect(resolveDownloadFileName('https://bedrocktweaks.net/download/abc123/BTRP-042.mcpack', 'fallback'))
      .toBe('BTRP-042.mcpack');
  });

  it('resolves a relative URL against the current page', () => {
    expect(resolveDownloadFileName('/download/abc123/BTRP-042.mcpack', 'fallback'))
      .toBe('BTRP-042.mcpack');
  });

  it('decodes percent-encoded file names', () => {
    expect(resolveDownloadFileName('https://bedrocktweaks.net/download/abc123/My%20Pack.mcpack', 'fallback'))
      .toBe('My Pack.mcpack');
  });

  it('keeps the raw segment when percent-encoding is malformed', () => {
    expect(resolveDownloadFileName('https://bedrocktweaks.net/download/abc123/100%.mcpack', 'fallback'))
      .toBe('100%.mcpack');
  });

  it('strips query strings and fragments', () => {
    expect(resolveDownloadFileName('https://bedrocktweaks.net/download/abc123/BTRP-042.mcpack?t=1#top', 'fallback'))
      .toBe('BTRP-042.mcpack');
  });

  // The regression behind BT-REACT-3: these used to throw out of the mutation's
  // onSuccess callback, which aborted the click that starts the download.
  it.each([
    ['an unparseable URL', 'not a url at all'],
    ['a malformed protocol', 'https,http://bedrocktweaks.net/download/abc/x.mcpack'],
    ['an empty string', ''],
    ['undefined', undefined],
  ])('does not throw for %s', (_label, downloadUrl) => {
    expect(() => resolveDownloadFileName(downloadUrl, 'fallback')).not.toThrow();
  });

  it('falls back to the pack name when no file name can be recovered', () => {
    expect(resolveDownloadFileName(undefined, 'BTRP-042')).toBe('BTRP-042');
    expect(resolveDownloadFileName('', 'BTRP-042')).toBe('BTRP-042');
    expect(resolveDownloadFileName('https://bedrocktweaks.net/download/', 'BTRP-042')).toBe('BTRP-042');
  });
});
